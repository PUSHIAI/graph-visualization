package com.pushi.gv.exception.handler;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

import org.hibernate.validator.internal.engine.path.PathImpl;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.pushi.gv.entity.vo.error.ApiErrorVO;
import com.pushi.gv.exception.exceptions.ApiAbandonedException;
import com.pushi.gv.exception.exceptions.ApiVersionException;
import com.pushi.gv.exception.exceptions.AuthException;
import com.pushi.gv.exception.exceptions.EntityExistsException;
import com.pushi.gv.exception.exceptions.EntityNotFoundException;
import com.pushi.gv.exception.exceptions.RoleException;
import com.pushi.gv.exception.exceptions.ViolationException;

/**
 * @author anj
 */
@ControllerAdvice
@ResponseBody
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    // 400
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(final MethodArgumentNotValidException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final List<String> errors = new ArrayList<>();
        StringBuilder message = new StringBuilder();
        for (final FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
            message.append(error.getDefaultMessage()).append("\n");
        }
        for (final ObjectError error : ex.getBindingResult().getGlobalErrors()) {
            errors.add(error.getObjectName() + ": " + error.getDefaultMessage());
            message.append(error.getDefaultMessage()).append("\n");
        }
        if (message.length() > 1) {
            message = new StringBuilder(message.substring(0, message.length() - 1));
        }

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), message.toString(), errors, ex.getClass().getSimpleName());
        return handleExceptionInternal(ex, apiError, headers, s, request);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(final HttpMessageNotReadableException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        String message = "";
        String[] errorStr = ex.getLocalizedMessage().split(",");

        for (String s : errorStr) {
            if (s.contains("fieldName")) {
                message = s;
            }
        }

        if ("".equals(message)) {
            message = "JSON 请求格式错误";
        } else {
            message = "JSON 请求格式错误： " + message;
        }

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), message, ex.getLocalizedMessage(), ex.getClass().getSimpleName());
        return handleExceptionInternal(ex, apiError, headers, s, request);
    }

    @Override
    protected ResponseEntity<Object> handleBindException(final BindException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final List<String> errors = new ArrayList<>();
        for (final FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.add(error.getField() + ": " + error.getDefaultMessage());
        }
        for (final ObjectError error : ex.getBindingResult().getGlobalErrors()) {
            errors.add(error.getObjectName() + ": " + error.getDefaultMessage());
        }

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), errors, ex.getClass().getSimpleName());
        return handleExceptionInternal(ex, apiError, headers, s, request);
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(final TypeMismatchException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final String error = ex.getValue() + " value for " + ex.getPropertyName() + " should be of type " + ex.getRequiredType();

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), error, ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestPart(final MissingServletRequestPartException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final String error = ex.getRequestPartName() + " part is missing";

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), error, ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    @Override
    protected ResponseEntity<Object> handleMissingServletRequestParameter(final MissingServletRequestParameterException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final String error = ex.getParameterName() + " parameter is missing";

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), error, ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    @Override
    protected ResponseEntity<Object> handleServletRequestBindingException(ServletRequestBindingException ex, HttpHeaders headers, HttpStatus status, WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), ex.getMessage(), ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Object> handleMethodArgumentTypeMismatch(final MethodArgumentTypeMismatchException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final String error = ex.getName() + " should be of type " + Objects.requireNonNull(ex.getRequiredType()).getName();

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), error, ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    @ExceptionHandler({ConstraintViolationException.class})
    public ResponseEntity<Object> handleConstraintViolation(final ConstraintViolationException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final List<String> errors = new ArrayList<>();
        StringBuilder message = new StringBuilder();
        for (final ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            errors.add(((PathImpl) violation.getPropertyPath()).getLeafNode().getName() + ": " + violation.getMessage());
            message.append(violation.getMessage()).append("\n");
        }
        if (message.length() > 1) {
            message = new StringBuilder(message.substring(0, message.length() - 1));
        }

        HttpStatus s = HttpStatus.BAD_REQUEST;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), message.toString(), errors, ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    //401
    @ExceptionHandler({AuthException.class})
    protected ResponseEntity<Object> handleAuthExistsException(final AuthException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.UNAUTHORIZED;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), "Authentication error", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    // 403
    @ExceptionHandler({ApiVersionException.class})
    protected ResponseEntity<Object> handleApiVersionException(final ApiVersionException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.FORBIDDEN;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), "您使用的版本不对应", "Forbidden", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    @ExceptionHandler({RoleException.class})
    protected ResponseEntity<Object> handleRoleException(final RoleException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.FORBIDDEN;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), "Forbidden", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    // 404
    @Override
    protected ResponseEntity<Object> handleNoHandlerFoundException(final NoHandlerFoundException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final String error = "No handler found for " + ex.getHttpMethod() + " " + ex.getRequestURL();

        HttpStatus s = HttpStatus.NOT_FOUND;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), error, ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    @ExceptionHandler({EntityNotFoundException.class})
    protected ResponseEntity<Object> handleEntityNotFoundException(final EntityNotFoundException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.NOT_FOUND;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), "EntityNotFound", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    // 405
    @Override
    protected ResponseEntity<Object> handleHttpRequestMethodNotSupported(final HttpRequestMethodNotSupportedException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final StringBuilder builder = new StringBuilder();
        builder.append(ex.getMethod());
        builder.append(" method is not supported for this request. Supported methods are ");
        ex.getSupportedHttpMethods().forEach(t -> builder.append(t + " "));

        HttpStatus s = HttpStatus.METHOD_NOT_ALLOWED;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), builder.toString(), ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    // 409
    @ExceptionHandler({EntityExistsException.class})
    protected ResponseEntity<Object> handleViolationException(final EntityExistsException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.CONFLICT;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), "Conflict", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    // 410
    @ExceptionHandler({ApiAbandonedException.class})
    protected ResponseEntity<Object> handleApiAbandonedException(final ApiAbandonedException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.GONE;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), "您使用的版本过旧，请及时更新到最新版本!", "Gone", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    // 415
    @Override
    protected ResponseEntity<Object> handleHttpMediaTypeNotSupported(final HttpMediaTypeNotSupportedException ex, final HttpHeaders headers, final HttpStatus status, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        final StringBuilder builder = new StringBuilder();
        builder.append(ex.getContentType());
        builder.append(" media type is not supported. Supported media types are ");
        ex.getSupportedMediaTypes().forEach(t -> builder.append(t + " "));

        HttpStatus s = HttpStatus.UNSUPPORTED_MEDIA_TYPE;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(),
                builder.substring(0, builder.length() - 2), ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }

    // 422
    @ExceptionHandler({ViolationException.class})
    protected ResponseEntity<Object> handleViolationException(final ViolationException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.UNPROCESSABLE_ENTITY;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), "Unprocessable Entity", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    @ExceptionHandler({MaxUploadSizeExceededException.class})
    protected ResponseEntity<Object> handleMaxUploadSizeExceededException(final MaxUploadSizeExceededException ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);

        HttpStatus s = HttpStatus.UNPROCESSABLE_ENTITY;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), "超出最大上传大小", ex.getLocalizedMessage(), ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, s);
    }

    // 500
    @ExceptionHandler({Exception.class})
    public ResponseEntity<Object> handleAll(final Exception ex, final WebRequest request) {
        logger.error(ex.getClass().getName(), ex);
        logger.error("error", ex);

        HttpStatus s = HttpStatus.INTERNAL_SERVER_ERROR;
        final ApiErrorVO apiError = new ApiErrorVO(s.value(), ex.getLocalizedMessage(), "error occurred", ex.getClass().getSimpleName());
        return new ResponseEntity<>(apiError, new HttpHeaders(), s);
    }
}