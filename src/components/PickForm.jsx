import './PickForm.css';

export default function PickForm() {
    return (
        <section className="pick-section">
            <div className="pick-container">

                <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSeSGyBhp9HLEFIljlsLk7L_ALVHZlinfmupWdbtjWOLed-ezg/viewform?embedded=true"
                    title="CFB Pick Form"
                    className="pick-iframe"
                    allowFullScreen
                >
                    Loading…</iframe>
            </div>
        </section>
    );
}
