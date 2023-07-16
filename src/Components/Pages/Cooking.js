import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import IconButton from "@mui/material/IconButton";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import Pause from "@mui/icons-material/Pause";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

import { DatabaseContext } from "../Contexts";

const musicAudioId = "musicAudio";

function Cooking() {
  const database = useContext(DatabaseContext);
  const { cookbook: _cookbook } = database;

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

  const renderTopButtonControls = () => {
    const iconProps = { sx: { fontSize: 30 } };
    return (
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
          variant="contained"
          size="small"
          sx={{ flexGrow: "1" }}
          onClick={() => {
            navigate(`/recipe/${recipeId}`);
          }}
        >
          <Typography>Back to recipe</Typography>
        </Button>
        <ButtonGroup>
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
            {playing ? (
              <Pause {...iconProps} />
            ) : (
              <PlayCircleOutlineIcon {...iconProps} />
            )}
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => {
              const newMuted = !muted;

              document.getElementById(musicAudioId).muted = newMuted;
              setMuted(newMuted);
            }}
          >
            {muted ? (
              <VolumeOffIcon {...iconProps} />
            ) : (
              <VolumeUpIcon {...iconProps} />
            )}
          </IconButton>
        </ButtonGroup>
      </Stack>
    );
  };

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
    const fontSize = 30;
    return (
      <>
        <Box sx={{ width: "100%" }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Instructions
              </Typography>
              <Stack spacing={1.5}>
                {instructions.map((instructionText, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography sx={{ fontWeight: "fontWeightBold", fontSize }}>
                      {index + 1}.
                    </Typography>
                    &nbsp;
                    <Typography sx={{ fontSize }}>{instructionText}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </>
    );
  };

  return (
    <>
      <Stack
        sx={{ paddingTop: "15px", width: "100%" }}
        spacing={0}
        alignItems="center"
      >
        {renderTopButtonControls()}
        <Stack key="contents" spacing={1} sx={{ width: "95%", marginTop: 1 }}>
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
