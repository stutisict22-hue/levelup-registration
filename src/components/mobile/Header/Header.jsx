import "./Header.css";

export default function Header() {
    return (
        <header className="header">
            <div className="logos-top">
                <a href="https://www.cii.in/" target="_blank" rel="noopener noreferrer">
                    <img src="/CII Logo.png" alt="CII" className="logo-left" />
                </a>
                <a href="https://gamingsociety.in/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/idges.png" alt="IDGES" className="logo-right" />
                </a>
            </div>

            <div className="header-center">
                <img src="/White.png" alt="Level Up" style={{ height: '250px', marginTop: '-85px', marginBottom: '-90px' }} />
            </div>
        </header>
    );
}
