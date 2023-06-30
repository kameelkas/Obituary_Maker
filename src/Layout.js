import { Outlet, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import CreatePage from "./CreatePage";

function Layout() {
  const [showObituary, setShowObituary] = useState(false);
  const [obituaries, setObituaries] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDescription, setShowDescription] = useState({});
  const [display, setDisplay] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const audioRef = useRef(null)


  useEffect(() => {
    const getTer = async () => {
      const recieve = await fetch(
        `https://qkyphnusivbabe4obxhs7v4g7e0wnash.lambda-url.ca-central-1.on.aws/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const deadList = await recieve.json();
      console.log(deadList);
      setObituaries(deadList.data);
      //   for(var i = 1; i<deadList.data.length; i++){
      //     addObituary(deadList.data[i-1]);
      //   }
    };
    getTer();
  }, []);

  const onScreen = () => {
    setShowCreate(!showCreate);
  };

  const handleShowObituary = (shouldShow) => {
    setShowObituary(shouldShow);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const addObituary = (obituary) => {
    const formattedObituary = {
      ...obituary,
      born: formatDate(obituary.Born),
      dead: formatDate(obituary.Dead),
    };
    setDisplay(true);
    setObituaries([formattedObituary, ...obituaries]);
    setShowDescription({
      [formattedObituary.id]: true,
      ...Object.fromEntries(obituaries.map((obituary) => [obituary.id, false])),
    });
  };

  const handleShowDescription = (id) => {
    setShowDescription({ ...showDescription, [id]: !showDescription[id] });
  };

  const toggleAudio = () => {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play()
      }
      setPlaying(!isPlaying);
    };

  const audioEnded = () => {
    setPlaying(false);
  };


  return (
    <div>
      <CreatePage
        showModal={showCreate}
        onScreen={onScreen}
        onShowObituary={handleShowObituary}
        addObituary={addObituary}
      />
      <nav>
        <div id="head">
          <h1>The Last Show</h1>
        </div>
        <aside>
          <button id="obituary-button" onClick={onScreen}>
            + New Obituary
          </button>
        </aside>
      </nav>
      {obituaries.length == 0 ? (
        <div id="empty-o-list">No Obituary Yet</div>
      ) : (
        <div id="o-list">
          {obituaries.map((obituary) => (
            <Link key={obituary.id} to={`/obituaries/${obituary.id}`}>
              <div id="o-boxes">
                <div
                  id="image-box"
                  onClick={() => handleShowDescription(obituary.id)}
                >
                  <img id="pose-picture" src={obituary.ImageURL} />
                  <br />
                  <h3>
                    <strong>
                      <i>{obituary.Name}</i>
                    </strong>
                  </h3>
                  <br />
                  {formatDate(obituary.Born)} - {formatDate(obituary.Dead)}
                </div>
                <br />
                {showDescription[obituary.id] && (
                  <div id="description">
                    {obituary.Obituary}
                    <div id="button">
                      <button className="play-pause" onClick={toggleAudio}>
                        {isPlaying ? '||' : '▶'}
                      </button>
                      <audio id="audio" ref={audioRef} src={obituary.SpeechURL} onEnded={audioEnded}></audio>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      <Outlet />
    </div>
  );
}

export default Layout;
