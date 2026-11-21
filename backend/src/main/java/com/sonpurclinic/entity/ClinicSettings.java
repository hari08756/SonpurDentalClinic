package com.sonpurclinic.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clinic_settings")
public class ClinicSettings {
    @Id
    private Long id = 1L;
    @Column(nullable = false, length = 120)
    private String clinicName = "Sonpur Dental Clinic";
    @Column(nullable = false)
    private Integer bookingFee = 100;
    @Column(length = 500)
    private String address = "";
    @Column(length = 30)
    private String phone = "";
    @Column(length = 160)
    private String email = "";
    @Column(length = 160)
    private String workingHours = "";
    @Column(length = 1000)
    private String description = "Comfortable, patient-focused dental care.";
    @Column(length = 255)
    private String qrImageFile;
    @Column(length = 255)
    private String logoImageFile;

    public ClinicSettings() {}
    public Long getId() { return id; }
    public String getClinicName() { return clinicName; }
    public void setClinicName(String clinicName) { this.clinicName = clinicName; }
    public Integer getBookingFee() { return bookingFee; }
    public void setBookingFee(Integer bookingFee) { this.bookingFee = bookingFee; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getQrImageFile() { return qrImageFile; }
    public void setQrImageFile(String qrImageFile) { this.qrImageFile = qrImageFile; }
    public String getLogoImageFile() { return logoImageFile; }
    public void setLogoImageFile(String logoImageFile) { this.logoImageFile = logoImageFile; }
}
