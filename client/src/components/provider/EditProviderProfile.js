import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./EditProviderProfile.css";

const servicesWithSub = {
  Embroidery: ["Hand Embroidery","Machine Embroidery","Pearl Embroidery","Beads Embroidery"],
  "Home Cooked Food": ["South Indian Meals","North Indian Meals","Snacks"],
  "Custom Gifts": ["Handmade Gifts","Birthday Gifts","Wedding Gifts","Anniversary Gifts"],
  "Arts & Crafts": ["Paintings","Paper Crafting","Clay Modelling","Collage Making"],
  "Fashion & Tailoring": ["Ladies Wear","Mens Wear","Kids Wear","Ethnic Wear","Party Wear"],
  "Beauty & Wellness": ["Bridal Makeup","Skin Care","Hair Care","Manicure & Pedicure","Full Body Massage"],
  "Sugar Bloom":["Cake Artistry","Cupcake & Muffin creations","Cookies & Biscuits","Bread & Pastry Delight"],
  "Event Decoration": ["Birthday Decor","Wedding Decor","Festive Decor","Anniversary Decor","Corporate Event Decor"],
  "Home Gardening Kits": ["Indoor Plants","Plant Kit","Herb Kit","Vegetable Kit","Flower Kit","Microgreen Kit"],
  "Traditional Festival Kits": ["Pooja Kits","Festival Essentials","Holi Festival Kit","Diwali Festival Kit","Ganapathi Festival Kit","Festive Delight Craft","Lotus Puja Decor Kit"],
};

const EditProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name:"", email:"", contact:"", service:"", subservices:[], description:"", price:"", location:"",
  });
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previewNew, setPreviewNew] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/services/${id}`);
        const service = res.data;
        if (service) {
          setFormData({
            name: service.providerName || "",
            email: service.providerEmail || "",
            contact: service.providerContact || "",
            service: service.title || "",
            subservices: service.subservices || [],
            description: service.description || "",
            price: service.price || "",
            location: service.location || "",
          });
          setImages(service.images?.map(img => `http://localhost:5000${img}`) || []);
        }
      } catch (err) {
        console.error("Fetch service error:", err);
      }
    };
    fetchService();
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubChange = (val, checked) => {
    setFormData(prev => {
      let subs = [...prev.subservices];
      if (checked) subs.push(val);
      else subs = subs.filter(s => s !== val);
      return { ...prev, subservices: subs };
    });
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(files);
    setPreviewNew(files.map(f => URL.createObjectURL(f)));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.service) newErrors.service = "Service required";
    if (formData.service && formData.subservices.length === 0) newErrors.subservices = "Select at least one subservice";
    if (!formData.description.trim()) newErrors.description = "Description required";
    if (!formData.contact.trim()) newErrors.contact = "Contact required";
    else if (!/^[0-9]{10}$/.test(formData.contact)) newErrors.contact = "Enter valid 10-digit number";
    if (!formData.email.trim()) newErrors.email = "Email required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) newErrors.email = "Enter valid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const token = localStorage.getItem("token");
    if (!token) return alert("Login required");

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("contact", formData.contact);
      fd.append("service", formData.service);
      fd.append("description", formData.description);
      fd.append("price", formData.price || "");
      fd.append("location", formData.location || "");
      formData.subservices.forEach(s => fd.append("subservices", s));
      newFiles.forEach(f => fd.append("images", f));

      await axios.put(`http://localhost:5000/api/services/${id}`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully");
      navigate("/provider/ProviderProfileView");
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    }
  };

  return (
    <div className="create-profile-container">
      <h2>Edit Your Profile</h2>
      <form className="create-profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input name="name" type="text" value={formData.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Contact</label>
          <input name="contact" type="text" value={formData.contact} onChange={handleChange} />
          {errors.contact && <span className="error">{errors.contact}</span>}
        </div>

        <div className="form-group">
          <label>Service</label>
          <select name="service" value={formData.service} onChange={handleChange}>
            <option value="">-- Select a Service --</option>
            {Object.keys(servicesWithSub).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.service && <span className="error">{errors.service}</span>}
        </div>

        {formData.service && (
          <div className="form-group">
            <label>Subservices</label>
            <div className="subservices-container">
              {servicesWithSub[formData.service].map(sub => (
                <label key={sub} className="checkbox-label">
                  <input type="checkbox" value={sub} checked={formData.subservices.includes(sub)} 
                    onChange={e => handleSubChange(sub, e.target.checked)} />
                  {sub}
                </label>
              ))}
            </div>
            {errors.subservices && <span className="error">{errors.subservices}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" rows={4} value={formData.description} onChange={handleChange} />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>Price</label>
          <input name="price" type="number" value={formData.price} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input name="location" type="text" value={formData.location} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Profile / Work Images</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
          <div className="image-preview-container">
            {images.map((src, i) => <img key={i} src={src} alt={`existing-${i}`} className="preview-image" />)}
            {previewNew.map((src, i) => <img key={`new-${i}`} src={src} alt={`new-${i}`} className="preview-image" />)}
          </div>
        </div>

        <button type="submit">💾 Save Changes</button>
      </form>
    </div>
  );
};

export default EditProviderProfile;
