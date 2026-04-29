package com.pushi.gv.exception.servlet.mvc.condition;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.springframework.http.MediaType;
import org.springframework.web.HttpMediaTypeException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.accept.ContentNegotiationManager;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.servlet.mvc.condition.AbstractRequestCondition;
import org.springframework.web.servlet.mvc.condition.RequestCondition;

import com.pushi.gv.exception.util.Version;


/**
 * 自定义请求条件匹配媒体类型接受版本.
 *
 * @author anj
 */
public class VersionRequestCondition extends AbstractRequestCondition<VersionRequestCondition> implements RequestCondition<VersionRequestCondition> {

    private final static String VERSION_PARAMETER = "version";

    private final static VersionRequestCondition PRE_FLIGHT_MATCH = new VersionRequestCondition();

    private static final VersionRequestCondition EMPTY_CONDITION = new VersionRequestCondition();

    private final ContentNegotiationManager contentNegotiationManager;

    private final Set<Version> versions;

    private final Set<MediaType> mediaTypes;

    private final boolean abandoned;

    VersionRequestCondition() {
        this.versions = Collections.singleton(new Version(0));
        this.mediaTypes = Collections.emptySet();
        this.contentNegotiationManager = new ContentNegotiationManager();
        this.abandoned = false;
    }

    public VersionRequestCondition(Collection<Version> versions, Collection<MediaType> mediaTypes, ContentNegotiationManager manager, boolean abandoned) {
        if (manager == null) {
            throw new NullPointerException();
        }

        this.mediaTypes = Collections.unmodifiableSet(new LinkedHashSet<>(mediaTypes));
        this.versions = Collections.unmodifiableSet(new LinkedHashSet<>(versions));
        this.contentNegotiationManager = manager;
        this.abandoned = abandoned;
    }

    @Override
    protected Collection<?> getContent() {
        return versions;
    }

    @Override
    protected String getToStringInfix() {
        return " || ";
    }

    @Override
    public VersionRequestCondition combine(VersionRequestCondition other) {
        return !other.versions.isEmpty() ? other : this;
    }

    @Override
    public VersionRequestCondition getMatchingCondition(HttpServletRequest request) {
        if (CorsUtils.isPreFlightRequest(request)) {
            return PRE_FLIGHT_MATCH;
        }
        if (isEmpty()) {
            return this;
        }

        List<MediaType> acceptedMediaTypes;
        try {
            acceptedMediaTypes = getAcceptedMediaTypes(request);
        } catch (HttpMediaTypeException ex) {
            return null;
        }

        List<Version> acceptVersions = getAcceptedVersions(acceptedMediaTypes);

        Set<Version> result = new LinkedHashSet<>(versions);
        for (Iterator<Version> iterator = result.iterator(); iterator.hasNext(); ) {
            Version version = iterator.next();
            if (!acceptVersions.contains(version)) {
                iterator.remove();
            }
        }

        if (!result.isEmpty()) {
            return new VersionRequestCondition(result, this.mediaTypes, this.contentNegotiationManager, this.abandoned);
        }

        // fallback
        if (acceptedMediaTypes.isEmpty()) {
            return EMPTY_CONDITION;
        } else {
            return null;
        }
    }

    @Override
    public int compareTo(VersionRequestCondition other, HttpServletRequest request) {
        if (other.versions.size() == this.versions.size()) {
            Version o = other.versions.iterator().next();
            Version s = this.versions.iterator().next();
            return o.compareTo(s);
        } else {
            return other.versions.size() - this.versions.size();
        }
    }

    private List<MediaType> getAcceptedMediaTypes(HttpServletRequest request) throws HttpMediaTypeNotAcceptableException {
        List<MediaType> mediaTypes = this.contentNegotiationManager.resolveMediaTypes(new ServletWebRequest(request));
        return mediaTypes.isEmpty() ? Collections.singletonList(MediaType.ALL) : mediaTypes;
    }

    private boolean isCompatible(MediaType type) {
        for (MediaType mediaType : mediaTypes) {
            if (mediaType.isCompatibleWith(type)) {
                return true;
            }
        }
        return false;
    }

    private List<Version> getAcceptedVersions(Collection<MediaType> mediaTypes) {
        List<Version> versions = new ArrayList<>(mediaTypes.size());
        for (MediaType type : mediaTypes) {
            if (!isCompatible(type)) {
                continue;
            }

            String s = type.getParameter(VERSION_PARAMETER);
            Version version = Version.parseVersion(s);
            if (version != null) {
                versions.add(version);
            }
        }
        return versions;
    }

    public boolean isAbandoned() {
        return abandoned;
    }
}
