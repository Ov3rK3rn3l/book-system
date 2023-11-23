const Header = () => {
    return (
        <header className="container-fluid d-flex justify-content-end">
            <div className=" d-flex align-items-center">
                <div>
                    <span className="d-block m-0 p-0 text-white">Plena Depilação</span>
                    <small className="m-0 p-0">Plano Gold</small>
                </div>
                <img src="https://cdn.vectorstock.com/i/1000x1000/94/36/woman-profile-neon-sign-vector-47869436.webp" alt="salao" />
                <span className="mdi mdi-chevron-down text-white"></span>
            </div>
        </header>
    );
}

export default Header;