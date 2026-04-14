import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../services/api";

const DEFAULT_AVATAR =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const ExistingMembers = () => {
    const [data, setData] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await axios.get(
                    `${BASE_URL}/api/existing-members`
                );
                setData(res.data);
            } catch (error) {
                console.error("Error fetching existing members:", error);
            }
        };

        fetchExisting();
    }, []);

    return (
        <div className="container mt-4">
            <h4 className="fw-bold mb-3">Existing Members</h4>

            <div className="table-responsive">
                <table className="table table-striped align-middle">
                    <thead >
                        <tr>
                            <th>ID</th>
                            <th>Photo</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Status</th>
                            <th>Membership End</th>
                            <th>Archived On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((m) => {
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
                                                    borderRadius: "50%",
                                                }}
                                                onClick={() => setSelectedImage(imageUrl)}
                                            />
                                        </td>

                                        <td>{m.first_name}</td>
                                        <td>{m.last_name}</td>
                                        <td>{m.email}</td>
                                        <td>{m.mobile}</td>
                                        <td>
                                            {m.status}
                                        </td>
                                        <td>{m.end_date}</td>
                                        <td>{m.deleted_at}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="text-center">
                                    No existing members found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    onClick={() => setSelectedImage(null)}
                    style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content p-3 text-center">
                            <img
                                src={selectedImage}
                                alt="Preview"
                                style={{ width: "100%", borderRadius: "10px" }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExistingMembers;
