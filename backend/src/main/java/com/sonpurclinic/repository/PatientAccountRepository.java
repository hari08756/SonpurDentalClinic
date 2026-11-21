package com.sonpurclinic.repository;

import com.sonpurclinic.entity.PatientAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientAccountRepository extends JpaRepository<PatientAccount, Long> {
    Optional<PatientAccount> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Long id);
}
