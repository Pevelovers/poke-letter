package com.pokeletter.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pokeletter.TestcontainersConfiguration;
import com.pokeletter.tree.Tree;
import com.pokeletter.tree.TreeRepository;
import com.pokeletter.user.Provider;
import com.pokeletter.user.User;
import com.pokeletter.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthFlowTests {

	@Autowired
	MockMvc mockMvc;

	@Autowired
	UserRepository userRepository;

	@Autowired
	TreeRepository treeRepository;

	@Test
	void 구글_로그인은_openid_범위만_요청한다() throws Exception {
		MvcResult result = mockMvc.perform(get("/oauth2/authorization/google"))
			.andExpect(status().is3xxRedirection())
			.andReturn();

		String location = result.getResponse().getRedirectedUrl();
		assertThat(location).startsWith("https://accounts.google.com/");
		assertThat(location).contains("scope=openid").doesNotContain("email").doesNotContain("profile");
	}

	@Test
	void 구글_로그인은_항상_계정_선택_화면을_보여_준다() throws Exception {
		MvcResult result = mockMvc.perform(get("/oauth2/authorization/google")).andReturn();

		assertThat(result.getResponse().getRedirectedUrl()).contains("prompt=select_account");
	}

	@Test
	void 카카오_로그인도_항상_계정_선택_화면을_보여_준다() throws Exception {
		MvcResult result = mockMvc.perform(get("/oauth2/authorization/kakao")).andReturn();

		assertThat(result.getResponse().getRedirectedUrl()).contains("prompt=select_account");
	}

	@Test
	void 카카오_로그인은_카카오_인가_주소로_이동한다() throws Exception {
		MvcResult result = mockMvc.perform(get("/oauth2/authorization/kakao"))
			.andExpect(status().is3xxRedirection())
			.andReturn();

		assertThat(result.getResponse().getRedirectedUrl())
			.startsWith("https://kauth.kakao.com/oauth/authorize")
			.contains("redirect_uri=http://localhost/login/oauth2/code/kakao");
	}

	@Test
	void 꺼진_제공자로는_로그인을_시작할_수_없다() throws Exception {
		// 기본 설정에서 네이버는 꺼져 있다 (검수 후 켬, POL-ACC-02)
		mockMvc.perform(get("/oauth2/authorization/naver"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void 없는_제공자_이름은_서버_오류가_아니라_401이다() throws Exception {
		// 주소를 복사하다 글자가 붙은 경우 (실제로 "google을"로 500이 났다)
		mockMvc.perform(get("/oauth2/authorization/google을"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	void 로그인하지_않으면_내_정보는_401이다() throws Exception {
		mockMvc.perform(get("/api/v1/me"))
			.andExpect(status().isUnauthorized())
			.andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
	}

	@Test
	void 트리가_없으면_내_정보의_tree는_null이다() throws Exception {
		User user = userRepository.saveAndFlush(new User(Provider.KAKAO, "1234"));

		mockMvc.perform(get("/api/v1/me").with(loginAs(user)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.provider").value("kakao"))
			.andExpect(jsonPath("$.tree").isEmpty());
	}

	@Test
	void 트리가_있으면_내_정보에_트리_요약이_있다() throws Exception {
		User user = userRepository.saveAndFlush(new User(Provider.GOOGLE, "sub-1"));
		treeRepository.saveAndFlush(new Tree("aB3dE5fG7h", user, "지우의 트리"));

		mockMvc.perform(get("/api/v1/me").with(loginAs(user)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.provider").value("google"))
			.andExpect(jsonPath("$.tree.treeId").value("aB3dE5fG7h"))
			.andExpect(jsonPath("$.tree.name").value("지우의 트리"))
			.andExpect(jsonPath("$.tree.messageCount").value(0));
	}

	@Test
	void 탈퇴하면_계정과_트리가_지워진다() throws Exception {
		User user = userRepository.saveAndFlush(new User(Provider.KAKAO, "1234"));
		treeRepository.saveAndFlush(new Tree("aB3dE5fG7h", user, "지우의 트리"));

		mockMvc.perform(delete("/api/v1/me").with(loginAs(user)).with(csrf()))
			.andExpect(status().isNoContent());

		assertThat(userRepository.findById(user.getId())).isEmpty();
		assertThat(treeRepository.findByPublicId("aB3dE5fG7h")).isEmpty();
	}

	@Test
	void CSRF_토큰이_없으면_탈퇴할_수_없다() throws Exception {
		User user = userRepository.saveAndFlush(new User(Provider.KAKAO, "1234"));

		mockMvc.perform(delete("/api/v1/me").with(loginAs(user)))
			.andExpect(status().isForbidden());

		assertThat(userRepository.findById(user.getId())).isPresent();
	}

	@Test
	void 로그아웃은_204로_답한다() throws Exception {
		User user = userRepository.saveAndFlush(new User(Provider.KAKAO, "1234"));

		mockMvc.perform(post("/api/v1/auth/logout").with(loginAs(user)).with(csrf()))
			.andExpect(status().isNoContent());
	}

	@Test
	void 익명_메시지_작성_경로는_CSRF와_로그인을_요구하지_않는다() throws Exception {
		// 아직 컨트롤러가 없으므로 404면 보안 필터는 통과한 것이다 (#16에서 구현)
		mockMvc.perform(post("/api/v1/trees/aB3dE5fG7h/messages"))
			.andExpect(status().isNotFound());
	}

	@Test
	void 응답에_CSRF_쿠키가_실린다() throws Exception {
		User user = userRepository.saveAndFlush(new User(Provider.KAKAO, "1234"));

		MvcResult result = mockMvc.perform(get("/api/v1/me").with(loginAs(user))).andReturn();

		assertThat(result.getResponse().getCookie("XSRF-TOKEN")).isNotNull();
	}

	@Test
	void 개발용_로그인은_기본_프로필에_없다() throws Exception {
		mockMvc.perform(post("/dev/login"))
			.andExpect(status().is4xxClientError());
		assertThat(userRepository.count()).isZero();
	}

	static org.springframework.test.web.servlet.request.RequestPostProcessor loginAs(User user) {
		OAuth2LoginUser principal = new OAuth2LoginUser(user.getId(), user.getProvider());
		Authentication token = new OAuth2AuthenticationToken(principal, principal.getAuthorities(),
				user.getProvider().name().toLowerCase());
		return authentication(token);
	}

}
