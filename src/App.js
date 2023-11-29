import React, { useState, useEffect } from 'react';
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

   
    const [showMainContent, setShowMainContent] = useState(false);
    const USAtlas = useUSAtlas();
    const statesInfo = useStatesInfo();
    const clustersInfo = useClustersInfo();
    
    // useEffect(() => {
    //     const handleMessage = (event) => {
    //         if (event.data === 'goToMainApp') {
    //             setShowMainContent(true);
    //         }
    //     };

    //     window.addEventListener('message', handleMessage);
    //     return () => window.removeEventListener('message', handleMessage);
    // }, []);




    if (!showMainContent) {
        return (
            <div className="App">
                <button onClick={() => setShowMainContent(true)}>Show Main Content</button>
                <iframe 
                    src={process.env.PUBLIC_URL+"/bubble_plot_avg_monthly_temperature.html"}
                    title="Bubble Plot Visualization"
                    width="100%"
                    height="1200"
                    allow="fullscreen"
              
              
                    style={{ border: 'none' }}
                />
                <iframe 
                    src={process.env.PUBLIC_URL+"/bubble_plot_avg_precipitation.html"}
                    title="Bubble Plot Visualization"
                    width="100%"
                    height="1300"
                    allow="fullscreen"
                
              
                    style={{ border: 'none' }}
                />
            </div>
        );
    }

    if (!USAtlas || !statesInfo || !clustersInfo) {
        return <pre>Loading...</pre>;
    }

    return (
        <div className="App">
            <button onClick={() => setShowMainContent(false)}>Show Main Content</button>
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
                <Typography variant="h4"  align='center' margin={10}>
                    {"Climate Category Map"}
                </Typography>
                
                <USAClimant USAtlas={USAtlas} statesInfo={statesInfo} />
                <Typography variant="h4"  align='center' margin={10}>
                    {"Temperature Map"}
                </Typography>
                <USAPoint USAtlas={USAtlas} statesInfo={statesInfo} />
                <Typography variant="h4"  align='center' margin={10}>
                    {"Precipitation Map"}
                </Typography>
                <USAPrecip USAtlas={USAtlas} statesInfo={statesInfo} />
                <Typography variant="h4"  align='center' margin={10}>
                    {"Detailed Map"}
                </Typography>
                <USAStateBase USAtlas={USAtlas} statesInfo={statesInfo} />
            </Container>
        </div>
    );
}

export default App;