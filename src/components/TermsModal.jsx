import { useState, useEffect } from 'react';

export default function TermsModal({ isOpen, onClose, onAccept }) {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (isOpen) setChecked(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('terms-modal-overlay')) onClose();
    };

    return (
        <div
            className="terms-modal-overlay active"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                className="terms-modal"
                role="dialog"
                aria-labelledby="termsModalTitle"
                aria-modal="true"
            >
                <div className="terms-header">
                    <i className="fas fa-file-contract"></i>
                    <h2 id="termsModalTitle">Terms of Use</h2>
                </div>

                <p className="terms-subhead">
                    Please review and accept the terms before proceeding to the Student Portal.
                </p>

                <div className="terms-scroll">
                    <p className="terms-date">
                        <strong>Effective date:</strong> January 1, 2026
                    </p>

                    <p className="terms-intro">
                        <strong>Welcome to CCNDM.</strong> The Columban College Nursing Discipline
                        Monitoring is a data-based tracking system designed to record, monitor, and
                        manage student community service requirements. By accessing, browsing, or
                        using this platform, you acknowledge that you have read, understood, and
                        agreed to comply with the following Terms of Use. If you do not accept these
                        terms in full, please discontinue use of the platform immediately.
                    </p>

                    <div className="terms-section">
                        <h3><span className="section-num">1</span> Acceptance of Terms</h3>
                        <p>
                            By clicking "I Agree" and proceeding to the Student Portal, you confirm
                            that you have read, understood, and accepted these Terms of Use, and that
                            you are at least 18 years of age or have parental/guardian consent to use
                            this system.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">2</span> Purpose of the System</h3>
                        <p>
                            SAOCST is a centralized, data-driven tracking platform that records and
                            monitors student community service hours, deadlines, and disciplinary
                            status. All data entered into the system is used solely for tracking,
                            verification, and reporting of community service compliance. The system is
                            intended for use by enrolled students and authorized administrators only.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">3</span> Data Collection &amp; Tracking</h3>
                        <ul>
                            <li>The platform collects and stores personal information, service records, timestamps, and activity logs necessary for tracking community service progress.</li>
                            <li>All tracked data is used exclusively for monitoring service hours, verifying compliance, and generating reports for authorized personnel.</li>
                            <li>You consent to the continuous tracking and recording of your service-related activity within the platform.</li>
                            <li>Data is retained for the duration required by institutional policy and applicable record-keeping regulations.</li>
                        </ul>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">4</span> User Responsibilities</h3>
                        <ul>
                            <li>You agree to provide accurate, current, and complete information during registration and throughout your use of the system.</li>
                            <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
                            <li>You agree not to misuse the platform, including but not limited to attempting unauthorized access, submitting false service records, or interfering with system operations.</li>
                        </ul>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">5</span> Data Privacy &amp; Record Keeping</h3>
                        <p>
                            Your personal information and service records will be stored and processed
                            in accordance with applicable data privacy laws and the institution's
                            privacy policy. As a tracking system, SAOCST maintains historical records
                            of your service activity. We implement reasonable security measures to
                            protect your data; however, we cannot guarantee absolute security.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">6</span> Service Verification</h3>
                        <p>
                            All community service submissions are subject to verification by authorized
                            personnel. SAOCST reserves the right to reject or revoke credit for any
                            service activity that does not meet institutional guidelines or that is
                            found to be falsified.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">7</span> Limitation of Liability</h3>
                        <p>
                            CCNDM and its developers shall not be liable for any direct, indirect,
                            incidental, or consequential damages arising from your use of, or inability
                            to use, the platform, including but not limited to loss of data, tracking
                            inaccuracies, or missed deadlines.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">8</span> Modifications</h3>
                        <p>
                            We may update these Terms of Use from time to time. Continued use of the
                            platform after changes are posted constitutes your acceptance of the
                            revised terms.
                        </p>
                    </div>

                    <div className="terms-section">
                        <h3><span className="section-num">9</span> Contact</h3>
                        <p>
                            If you have any questions about these Terms, please contact the Nursing
                            Department Office at <strong>ccndm@gmail.com</strong>.
                        </p>
                    </div>
                </div>

                <div className="terms-checkbox">
                    <input
                        type="checkbox"
                        id="termsCheckbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <label htmlFor="termsCheckbox">
                        I have read and agree to the <strong>Terms of Use</strong> of the CCNDM platform.
                    </label>
                </div>

                <div className="terms-actions">
                    <button className="terms-btn terms-btn-secondary" onClick={onClose}>
                        <i className="fas fa-times"></i> Cancel
                    </button>
                    <button
                        className="terms-btn terms-btn-primary"
                        disabled={!checked}
                        onClick={onAccept}
                    >
                        <i className="fas fa-check"></i> I Agree &amp; Continue
                    </button>
                </div>
            </div>
        </div>
    );
}