package com.pokeletter.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pokeletter.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class DevLoginTests {

	@Autowired
	MockMvc mockMvc;

	@Test
	void dev_프로필에서는_개발용_로그인으로_세션이_생긴다() throws Exception {
		MockHttpSession session = (MockHttpSession) mockMvc
			.perform(post("/dev/login").param("provider", "GOOGLE").param("id", "tester"))
			.andExpect(status().isNoContent())
			.andReturn()
			.getRequest()
			.getSession(false);

		mockMvc.perform(get("/api/v1/me").session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.provider").value("google"));
	}

}
