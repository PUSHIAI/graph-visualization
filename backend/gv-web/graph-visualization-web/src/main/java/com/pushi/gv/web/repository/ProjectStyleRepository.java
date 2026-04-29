package com.pushi.gv.web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.pushi.gv.web.entity.project.ProjectStyle;

@Repository
public interface ProjectStyleRepository extends JpaRepository<ProjectStyle, Long>, JpaSpecificationExecutor<ProjectStyle> {
}

