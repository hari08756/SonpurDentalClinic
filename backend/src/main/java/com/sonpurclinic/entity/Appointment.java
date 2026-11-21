package com.sonpurclinic.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_appointment_code", columnList = "booking_code", unique = true),
    @Index(name = "idx_appointment_status", columnList = "status")
})
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "booking_code", nullable = false, unique = true, length = 24)
    private String bookingCode;
    @Column(nullable = false, length = 100)
    private String patientName;
    @Column(nullable = false, length = 20)
    private String phone;
    private Integer age;
    @Column(length = 1000)
    private String problem;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "slot_id", nullable = false)
    private AvailabilitySlot slot;
    @Column(nullable = false)
    private Integer amount;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;
    @Column(length = 100)
    private String upiTransactionId;
    @Column(length = 255)
    private String paymentProofFile;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_account_id")
    private PatientAccount patientAccount;
    @Column(length = 500)
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    @Column(nullable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }
    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public String getProblem() { return problem; }
    public void setProblem(String problem) { this.problem = problem; }
    public AvailabilitySlot getSlot() { return slot; }
    public void setSlot(AvailabilitySlot slot) { this.slot = slot; }
    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
    public String getUpiTransactionId() { return upiTransactionId; }
    public void setUpiTransactionId(String upiTransactionId) { this.upiTransactionId = upiTransactionId; }
    public String getPaymentProofFile() { return paymentProofFile; }
    public void setPaymentProofFile(String paymentProofFile) { this.paymentProofFile = paymentProofFile; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public PatientAccount getPatientAccount() { return patientAccount; }
    public void setPatientAccount(PatientAccount patientAccount) { this.patientAccount = patientAccount; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}
