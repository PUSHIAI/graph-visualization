package com.pushi.gv.exception.servlet.mvc.method.annotation;

import java.lang.reflect.Method;
import java.util.LinkedHashSet;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.condition.RequestCondition;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import com.pushi.gv.exception.annotation.ApiAbandoned;
import com.pushi.gv.exception.annotation.ApiVersion;
import com.pushi.gv.exception.annotation.ApiVersions;
import com.pushi.gv.exception.exceptions.ApiAbandonedException;
import com.pushi.gv.exception.servlet.mvc.condition.VersionRequestCondition;
import com.pushi.gv.exception.util.Version;

/**
 * 自定义ApiVersion注释处理.
 *
 * @author anj
 */
public class VersionRequestMappingHandlerMapping extends RequestMappingHandlerMapping {

    private static Version parseVersion(ApiVersion apiVersion) {
        int major = apiVersion.major();
        int minor = apiVersion.minor();
        String v = apiVersion.value();

        final Version version;
        if (major >= 0) {
            version = minor >= 0 ? new Version(major, minor) : new Version(major);
        } else {
            version = Version.parseVersion(v);
            if (version == null) {
                throw new IllegalArgumentException("invalid version: " + v);
            }
        }
        return version;
    }

    @Override
    protected RequestCondition<?> getCustomMethodCondition(Method method) {
        Set<MediaType> mediaTypes = getMediaTypes(method);

        Set<Version> versions = getVersions(method);

        boolean abandoned = isAbandonedMappingMethod(method);

        if (!versions.isEmpty() || abandoned) {
            return new VersionRequestCondition(versions, mediaTypes, getContentNegotiationManager(), abandoned);
        }
        return null;
    }

    protected Set<MediaType> getMediaTypes(Method method) {
        RequestMapping requestMapping = AnnotatedElementUtils.findMergedAnnotation(method, RequestMapping.class);

        Set<MediaType> mediaTypes = new LinkedHashSet<>();
        if (requestMapping != null) {
            for (String produce : requestMapping.produces()) {
                MediaType mediaType = MediaType.parseMediaType(produce);
                mediaTypes.add(mediaType);
            }

            if (mediaTypes.isEmpty()) {
                Class<?> handlerType = method.getDeclaringClass();
                RequestMapping handlerRequestMapping = AnnotatedElementUtils.findMergedAnnotation(handlerType, RequestMapping.class);

                if (handlerRequestMapping != null) {
                    for (String produce : handlerRequestMapping.produces()) {
                        MediaType mediaType = MediaType.parseMediaType(produce);
                        mediaTypes.add(mediaType);
                    }
                }
            }
            if (mediaTypes.isEmpty()) {
                mediaTypes.add(MediaType.ALL);
            }
        }
        return mediaTypes;
    }

    @Override
    protected void handleMatch(RequestMappingInfo mapping, String lookupPath, HttpServletRequest request) {
        VersionRequestCondition condition = (VersionRequestCondition) mapping.getCustomCondition();
        if (condition != null && condition.isAbandoned()) {
            // TODO 抛合适的异常
            throw new ApiAbandonedException();
        }
        super.handleMatch(mapping, lookupPath, request);
    }

    protected Set<Version> getVersions(Method method) {
        Set<ApiVersion> apiVersions = AnnotatedElementUtils.findMergedRepeatableAnnotations(method, ApiVersion.class, ApiVersions.class);
        Set<Version> versions = new LinkedHashSet<>(apiVersions.size());
        for (ApiVersion apiVersion : apiVersions) {
            versions.add(parseVersion(apiVersion));
        }

        if (versions.isEmpty()) {
            Class<?> handlerType = method.getDeclaringClass();
            Set<ApiVersion> handlerApiVersions = AnnotatedElementUtils.findMergedRepeatableAnnotations(handlerType, ApiVersion.class, ApiVersions.class);
            for (ApiVersion apiVersion : handlerApiVersions) {
                versions.add(parseVersion(apiVersion));
            }
        }

        return versions;
    }

    private boolean isAbandonedMappingMethod(Method method) {
        ApiAbandoned abandoned = AnnotatedElementUtils.findMergedAnnotation(method, ApiAbandoned.class);
        return abandoned != null;
    }
}
