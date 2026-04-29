package com.pushi.gv.web.common.interceptor.response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import com.pushi.gv.entity.vo.error.ApiErrorVO;
import com.pushi.gv.entity.vo.success.ApiSuccessVO;

/**
 * 返回参数自定义响应
 *
 * @author sii
 */
@ControllerAdvice
public class FormatResponseBodyAdvice implements ResponseBodyAdvice {

    /**
     * Whether this component supports the given controller method return type
     * and the selected {@code HttpMessageConverter} type.
     *
     * @param returnType    the return type
     * @param converterType the selected converter type
     * @return {@code true} if {@link #beforeBodyWrite} should be invoked;
     * {@code false} otherwise
     */
    @Override
    public boolean supports(@Nullable MethodParameter returnType, @Nullable Class converterType) {
        return true;
    }

    /**
     * Invoked after an {@code HttpMessageConverter} is selected and just before
     * its write method is invoked.
     *
     * @param body                  the body to be written
     * @param returnType            the return type of the controller method
     * @param selectedContentType   the content type selected through content negotiation
     * @param selectedConverterType the converter type selected to write to the response
     * @param request               the current request
     * @param response              the current response
     * @return the body that was passed in or a modified (possibly new) instance
     */
    @Override
    public Object beforeBodyWrite(Object body, @Nullable MethodParameter returnType, @Nullable MediaType selectedContentType,
                                  @Nullable Class selectedConverterType, @Nullable ServerHttpRequest request, @Nullable ServerHttpResponse response) {
        if (request != null) {
            String[] filters = {"swagger-resources", "v2/api-docs", "v2/api-docs-ext", "doc.html", "webjars"};
            for (String filter : filters) {
                try {
                    if (request.getURI().getPath().contains(filter)) {
                        return body;
                    }
                } catch (Exception ignored) {
                }
            }
        }

        if (body instanceof ApiErrorVO || body instanceof ApiSuccessVO || body instanceof String) {
            return body;
        } else {
            int status = HttpStatus.OK.value();
            if (response instanceof ServletServerHttpResponse) {
                status = ((ServletServerHttpResponse) response).getServletResponse().getStatus();
            }
            if (response != null) {
                response.getHeaders().setContentType(MediaType.parseMediaType(MediaType.APPLICATION_JSON_UTF8_VALUE));
            }
            HttpStatus httpStatus = HttpStatus.resolve(status);
            if (httpStatus != null) {
                switch (httpStatus) {
                    case NO_CONTENT:
                        return new ApiSuccessVO(HttpStatus.NO_CONTENT.value(), "NO_CONTENT", body);
                    case CREATED:
                        List<String> location = null;
                        if (response != null) {
                            location = response.getHeaders().get("Location");
                        }
                        if (location == null || location.size() == 0) {
                            return new ApiSuccessVO(HttpStatus.CREATED.value(), "CREATED", body);
                        }

                        if (body == null) {
                            Map<String, Object> map = new HashMap<>();
                            if (location.size() > 1) {
                                map.put("datas", location);
                            } else {
                                map.put("data", location.get(0));
                            }
                            return new ApiSuccessVO(HttpStatus.CREATED.value(), "CREATED", map);
                        } else {
                            return new ApiSuccessVO(HttpStatus.CREATED.value(), "CREATED", body);
                        }
                    default:
                        return new ApiSuccessVO(body);
                }
            }
            return new ApiSuccessVO(body);
        }
    }
}
