package com.pokeletter.global.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/** 공통 에러 응답 ({@code docs/api/api-spec.md}의 "에러 응답"). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(String code, String message, Map<String, String> fields) {

	public static ErrorResponse of(String code, String message) {
		return new ErrorResponse(code, message, null);
	}

}
