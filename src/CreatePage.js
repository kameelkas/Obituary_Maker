import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css";
import blackRose from "./black_flower_design.png";
import { v4 as uuidv4 } from "uuid";

function CreatePage({ showModal, onScreen, addObituary }) {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000; // Offset in milliseconds
  const today = new Date(now - timezoneOffset).toISOString().slice(0, 16); // Get current date in ISO format

  const [name, setName] = useState("");
  const [born, setBorn] = useState("");
  const [dead, setDead] = useState(today);
  const [img, setImg] = useState("");
  const [audio, setAudio] = useState(null);
  const [showObituary, setShowObituary] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [descript, setDescript] = useState("");
  const [alertShown, setAlertShown] = useState(false);

  const handleBornDate = () => {
    if (born > dead) {
      window.alert("Born date cannot be after dead date");
      setBorn("");
    }
  };

  const handleDeadDate = () => {
    if (dead > today) {
      window.alert("Dead date cannot be after today. Please do not go killing people.");
      setDead(today);
    }
  };

  useEffect(() => {
    handleBornDate();
    handleDeadDate();
  }, [born, dead]);

  useEffect(() => {
    if (img !== "" && name !== "" && born !== "" && dead !== "") {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [img, name, born, dead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      setIsLoading(true);
      setShowObituary(true);
      const imageFile = new FormData();
      const id = uuidv4();
      imageFile.append("Image", img);
      const makeObituary = async () => {
        const reply = await fetch(
          "https://juboz4jrlxin4rzgdfphcqdcpq0rxfln.lambda-url.ca-central-1.on.aws",
          {
            method: "POST",
            headers: {
              name: name,
              dead: dead,
              born: born,
              id: id,
            },
            body: imageFile,
          }
        );

        const gotten = await reply.text();
        const info = JSON.parse(gotten);
        const bodyInfo = info.body;
        const allinfo = JSON.parse(JSON.parse(bodyInfo));
        //You can get the individual fields as i did in line 57 and then use those in the addObituary function
        console.log(allinfo);
        setDescript(allinfo.Obituary);
        setImg(allinfo.ImageURL);
        setAudio(allinfo.SpeechURL);
        setName(allinfo.Name);
        setBorn(allinfo.Born);
        setDead(allinfo.Dead)

      };

      makeObituary();

      console.log("Form submitted before adding");
      //   const obituary = {
      //     id: id,
      //     img,
      //     name,
      //     born,
      //     dead,
      //   };

      //   addObituary(obituary);

      //   console.log("After adding");
      //   setIsLoading(false);
      //   onScreen();
    } else {
      window.alert("Fill all inputs");
    }
  };
  useEffect(() => {
    if (descript !== "") {
      const obituary = {
        id: uuidv4(),
        img,
        name,
        born,
        dead,
        descript,
        audio,
      };
      addObituary(obituary);
      setIsLoading(false);
      onScreen();
      setImg("");
      setName("");
      setBorn("");
      setDead(today);
      setDescript("");
      setAudio(null);
    }
  }, [
    descript,
    img,
    name,
    born,
    dead,
    today,
    audio,
  ]);
  if (!showModal) return null;



  return (
    <div id="new-Obituary">
      <button id="exit" onClick={onScreen}>
        X
      </button>
      <div id="title">
        <strong>Create a New Obituary</strong>
      </div>
      {!showObituary && (
        <>
          <div>
            <img id="blackrose" src={blackRose} height={80} width={250} />
          </div>
          <br />
          <br />
          <form id="template">
            <input
              type="file"
              required
              accept="images/*"
              id="image-input"
              onChange={(e) => setImg(e.target.files[0])}
            />
            <label id="image-bar" htmlFor="image-input">
              {img
                ? `Select an image for the deceased (${img.name})`
                : "Select an image for the deceased"}
            </label>
            <br />
            <br />
            <input
              id="name-bar"
              type="text"
              required
              placeholder="Name of the deceased"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <br />
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
            <label>
              <em>Born: </em>
            </label>
            <input
              id="born-input"
              required
              type="datetime-local"
              value={born}
              onChange={(e) => setBorn(e.target.value)}
            />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <label>
              <em>Died: </em>
            </label>
            <input
              id="dead-input"
              required
              type="datetime-local"
              defaultValue={today}
              onChange={(e) => setDead(e.target.value)}
            />
            <br />
            <br />
            <button
              id="write-button"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Please wait...!" : "Write Obituary"}
            </button>
          </form>
        </>
      )}
      {showObituary &&
        (setIsLoading(true),
        setShowObituary(false),
        setName(""),
        setImg(""),
        setBorn(""),
        setDead(today),
        setDescript(""))}
    </div>
  );
}

export default CreatePage;
