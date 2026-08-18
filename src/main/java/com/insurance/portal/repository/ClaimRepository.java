package com.insurance.portal.repository;

import com.insurance.portal.model.Claim;
import com.insurance.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUser(User user);
    List<Claim> findByOrderBySubmissionDateDesc();
}
