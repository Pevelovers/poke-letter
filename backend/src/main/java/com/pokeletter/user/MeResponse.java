package com.pokeletter.user;

/**
 * {@code GET /api/v1/me} 응답.
 *
 * @param provider 로그인 제공자 ({@code google}, {@code kakao}, {@code naver})
 * @param tree 내 트리. 없으면 {@code null}
 */
public record MeResponse(String provider, TreeSummary tree) {

	/**
	 * @param treeId 공유 ID ({@code trees.public_id})
	 */
	public record TreeSummary(String treeId, String name, long messageCount) {
	}

}
