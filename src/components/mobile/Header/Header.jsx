import "./Header.css";

export default function Header() {
    return (
        <header className="header">
            <div className="logos-top">
                <a href="https://gamingsociety.in/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/idges.png" alt="IDGES" className="logo-left" />
                </a>
                <a href="https://www.cii.in/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/cii.png" alt="CII" className="logo-right" />
                </a>
            </div>

            <div className="header-center">
                <a href="https://gamingsociety.in/" target="_blank" rel="noopener noreferrer">
                    <img src="/assets/levelup.png" alt="Level Up" />
                </a>
                <p>EMPOWERING THE FUTURE OF GAMING</p>
            </div>
        </header>
    );
}
