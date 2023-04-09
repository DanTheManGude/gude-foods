import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Pause from "@mui/icons-material/Pause";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const musicAudioId = "musicAudio";

function Cooking(props) {
  const {
    database: { cookbook: _cookbook },
  } = props;

  const { recipeId } = useParams();

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState([]);

  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  let navigate = useNavigate();

  useEffect(() => {
    const cookbook = _cookbook || {};

    const recipe = cookbook[recipeId];
    if (recipe) {
      const { name: _name, instructions: _instructions } = recipe;
      setName(_name);
      setInstructions(_instructions);
    }
  }, [recipeId, _cookbook]);

  const renderTopButtonControls = () => (
    <Stack
      key="buttonControl"
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      sx={{ width: "95%" }}
      spacing={2}
    >
      <Button
        color="secondary"
        variant="outlined"
        size="small"
        sx={{ flexGrow: "1" }}
        onClick={() => {
          navigate(`/recipe/${recipeId}`);
        }}
      >
        <Typography>Back to recipe</Typography>
      </Button>
      <ButtonGroup variant="text">
        <IconButton
          color="primary"
          onClick={() => {
            if (playing) {
              document.getElementById(musicAudioId).pause();
            } else {
              document.getElementById(musicAudioId).play();
            }
            setPlaying(!playing);
          }}
        >
          {playing ? <Pause /> : <PlayCircleOutlineIcon />}
        </IconButton>
        <IconButton
          onClick={() => {
            const newMuted = !muted;

            document.getElementById(musicAudioId).muted = newMuted;
            setMuted(newMuted);
          }}
        >
          {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </ButtonGroup>
    </Stack>
  );

  const renderName = () => {
    return (
      <Typography
        key="title"
        variant="h5"
        sx={{
          color: "primary.main",
          textAlign: "left",
          width: "100%",
          marginBottom: 1,
        }}
      >
        {name}
      </Typography>
    );
  };

  const renderInstructions = () => {
    return <>{instructions.map((step) => step)}</>;
  };

  return (
    <>
      <Stack
        sx={{ paddingTop: "15px", width: "100%" }}
        spacing={0}
        alignItems="center"
      >
        {renderTopButtonControls()}
        <Stack key="contents" spacing={2} sx={{ width: "95%", marginTop: 1 }}>
          {renderName()}
          {renderInstructions()}
        </Stack>
      </Stack>
      <audio id={musicAudioId} autoPlay muted loop>
        <source src={`/media/music.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}

export default Cooking;
