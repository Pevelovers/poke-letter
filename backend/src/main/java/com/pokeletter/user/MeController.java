package com.pokeletter.user;

import com.pokeletter.auth.LoginPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "계정", description = "로그인한 트리 주인의 정보와 탈퇴")
@RestController
@RequestMapping("/api/v1/me")
class MeController {

	private final MeService meService;

	MeController(MeService meService) {
		this.meService = meService;
	}

	@Operation(summary = "내 정보", description = "로그인 제공자와 내 트리 요약. 트리가 없으면 tree는 null")
	@ApiResponse(responseCode = "200", description = "성공")
	@ApiResponse(responseCode = "401", description = "로그인 필요 (UNAUTHORIZED)")
	@GetMapping
	ResponseEntity<MeResponse> me(@AuthenticationPrincipal LoginPrincipal principal) {
		return meService.me(principal.userId())
			.map(ResponseEntity::ok)
			.orElseGet(() -> ResponseEntity.status(401).build());
	}

	@Operation(summary = "탈퇴", description = "계정, 트리, 받은 메시지를 즉시 삭제하고 세션을 끝낸다 (POL-PRV-03). CSRF 필요")
	@ApiResponse(responseCode = "204", description = "삭제 완료")
	@ApiResponse(responseCode = "401", description = "로그인 필요 (UNAUTHORIZED)")
	@ApiResponse(responseCode = "403", description = "CSRF 토큰 없음 (FORBIDDEN)")
	@DeleteMapping
	ResponseEntity<Void> withdraw(@AuthenticationPrincipal LoginPrincipal principal, HttpServletRequest request,
			HttpServletResponse response) {
		meService.withdraw(principal.userId());
		new SecurityContextLogoutHandler().logout(request, response, null);
		return ResponseEntity.noContent().build();
	}

}
