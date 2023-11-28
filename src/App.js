import USAStateBase from "./components/USAState/USAStateBase";
import { useUSAtlas } from "./actions/getUSA";
import { useStatesInfo } from "./actions/getStatesInfo";
import { useClustersInfo } from "./actions/getCluster";
import USAPoint from "./components/USAPoint/USAPoint";
import USAClimant from "./components/USAClimant/USAClimant";
import USAPrecip from "./components/USAPrecip/USAPrecip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function App() {
    const USAtlas = useUSAtlas();
    const statesInfo = useStatesInfo();
    const clustersInfo = useClustersInfo();

    if (!USAtlas || !statesInfo || !clustersInfo) {
        return <pre>Loading...</pre>;
    }
    return (
        <div className="App">
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ m: "5em auto auto 2em" }}
            >
                <Typography variant="h3" component="h2">
                    {"Climate Visualization"}
                </Typography>
            </Box>
            <Container>
                <USAClimant USAtlas={USAtlas} statesInfo={statesInfo} />
                <USAPoint USAtlas={USAtlas} statesInfo={statesInfo} />
                <USAPrecip USAtlas={USAtlas} statesInfo={statesInfo} />
                <USAStateBase USAtlas={USAtlas} statesInfo={statesInfo} />
            </Container>
        </div>
    );
}

export default App;
