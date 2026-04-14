import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../../services/api";

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=User&background=0d6efd&color=fff";

const Members = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const filter = queryParams.get("status") || "all";


    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [search, setSearch] = useState("");

    const fetchMembers = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${BASE_URL}/api/members`,
                {
                    params: {
                        status: filter,
                        search
                    }
                }
            );

            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchMembers();
    }, [filter]);

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <h2>Members</h2>

            {/* 🔍 SEARCH BAR */}
            <div className="row mb-3">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by ID / Mobile / Email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-1">
                    <button
                        style={{ color: "white", backgroundColor: "black" }}
                        className="btn "
                        onClick={fetchMembers}
                    >
                        Search
                    </button>
                </div>
                <div className="col-md-2">
                    <button
                        style={{ color: "black", backgroundColor: "transparent", border: "1px solid black" }}
                        className="btn "
                        onClick={() => {
                            setSearch("");
                            fetchMembers();
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <table className="table table-striped align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Photo</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Membership End</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map(m => {
                            const imageUrl = m.image
                                ? `${BASE_URL}/uploads/${m.image}`
                                : DEFAULT_AVATAR;

                            return (
                                <tr key={m.id}>
                                    <td>{m.id}</td>

                                    <td>
                                        <img
                                            src={imageUrl}
                                            alt="member"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                cursor: "pointer",
                                                borderRadius: "50%"
                                            }}
                                            onClick={() =>
                                                setSelectedImage(imageUrl)
                                            }
                                        />
                                    </td>

                                    <td>{m.first_name}</td>
                                    <td>{m.last_name}</td>
                                    <td>{m.email}</td>
                                    <td>{m.mobile}</td>
                                    <td>{m.status}</td>
                                    <td>{m.end_date}</td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center">
                                No members found
                            </td>
                        </tr>
                    )}
                </tbody >
            </table >

            {/* IMAGE MODAL */}
            {
                selectedImage && (
                    <div
                        className="modal fade show"
                        style={{
                            display: "block",
                            backgroundColor: "rgba(0,0,0,0.6)"
                        }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered modal-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-content position-relative">

                                <button
                                    type="button"
                                    className="btn-close position-absolute"
                                    style={{ top: "10px", right: "10px", zIndex: 10 }}
                                    onClick={() => setSelectedImage(null)}
                                ></button>

                                <div className="modal-body text-center">
                                    <img
                                        src={selectedImage}
                                        alt="Full Size"
                                        className="img-fluid rounded"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Members;
