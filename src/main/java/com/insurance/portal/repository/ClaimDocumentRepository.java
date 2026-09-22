package com.insurance.portal.repository;

import com.insurance.portal.model.ClaimDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {
}