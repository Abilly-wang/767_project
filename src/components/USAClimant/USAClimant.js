import {
    geoAlbersUsa,
    geoPath,
    interpolateReds,
    interpolateBlues,
    interpolateYlGnBu,
    interpolateRgb,
    scaleSequential,
    scaleLinear,
    scaleBand,
} from "d3";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useState, useEffect, Fragment } from "react";
import "./styles.css";
import { AbbrToFull } from "../../constants/StateHash";

const projection = geoAlbersUsa();
const path = geoPath(projection);

const width = 960;
const height = 500;

const tempLegendColors = ["rgb(255, 204, 204)", "rgb(255, 100, 100)", "rgb(255, 50, 50)", "rgb(204, 0, 0)"];
const tempLegendLabels = ["Cold", "Cool", "Warm", "Hot"];

const rainLegendColors = ["rgb(189, 218, 255)", "rgb(139, 190, 255)", "rgb(50, 118, 208)", "rgb(0, 57, 131)"];
const rainLegendLabels = ["Trace", "Light", "Moderate", "Heavy"];



const allColors = ['rgb(222, 211, 229)',
'rgb(197, 197, 229)',
'rgb(222, 159, 177)',
'rgb(152, 161, 206)',
'rgb(197, 145, 177)',
'rgb(222, 134, 152)',
'rgb(127, 130, 167)',
'rgb(197, 120, 152)',
'rgb(196, 109, 127)',
'rgb(152, 109, 154)',
'rgb(171, 95, 127)',
'rgb(152, 84, 129)',
'rgb(127, 78, 115)',
'rgb(127, 59, 104)',
'rgb(127, 53, 90)',
'rgb(102, 28, 65)'];
const allLabels = ['Cold-Trace',
'Cold-Light',
'Cool-Trace',
'Cold-Moderate',
'Cool-Light',
'Warm-Trace',
'Cold-Heavy',
'Warm-Light',
'Hot-Trace',
'Cool-Moderate',
'Hot-Light',
'Warm-Moderate',
'Cool-Heavy',
'Hot-Moderate',
'Warm-Heavy',
'Hot-Heavy'];

const Legend = ({ colors, labels }) => (
    <div className="legend" style={{ marginRight: "20px" }}>
        {labels.map((label, i) => (
            <div key={i} className="legend-item">
                <svg width="50" height="22">
                    <rect width="40" height="20" fill={colors[i]} />
                </svg>
                <span>{label}</span>
            </div>
        ))}
    </div>
);

const BarChart = ({ data }) => {
    const height = 500;
    const width = 600;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const x = scaleBand()
        .domain(data.map(d => d.name))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = scaleLinear()
        .domain([0, Math.max(...data.map(d => d.value))])
        .nice()
        .range([height - margin.bottom - 50, margin.top]);
    
    return (
        <svg width={width} height={height} style={{ marginBottom: "50px" }}>
            {data.map(d => (
                
                <g key={d.name}>
                    <rect
                        x={x(d.name)}
                        y={y(d.value)}
                        height={y(0) - y(d.value)}
                        width={x.bandwidth()}
                        fill={d.color}
                        
                    />
                    <text
                        x={x(d.name) + x.bandwidth() / 2}
                        y={y(d.value) - 5}
                        textAnchor="middle"
                        fill="black"
                    >
                        {d.value}
                    </text>
                    <text
                        x={x(d.name) + x.bandwidth() / 2}
                        y={height - 50}
                        textAnchor="middle"
                        fill="black"
                        transform={`rotate(-45, ${x(d.name) + x.bandwidth() / 2}, ${height - 10})`}
                    >
                        {d.name}
                    </text>
                </g>
            ))}
        </svg>
    );
};

const USAClimant = ({ USAtlas: { states, interiors }, statesInfo }) => {
    const [month, setMonth] = useState(1);
    const [dataMap, setDataMap] = useState(new Map());
    const [maxValue_temp, setMaxValue_temp] = useState(-100);
    const [minValue_temp, setMinValue_temp] = useState(100);
    const [maxValue_rain, setMaxValue_rain] = useState(-100);
    const [minValue_rain, setMinValue_rain] = useState(100);
    const [stateTemp, setStateTemp] = useState("");
    const [stateRain, setStateRain] = useState("");
    const [showChart, setShowChart] = useState(false);
    const [barChartData, setBarChartData] = useState([]);
    const attribute_temp = "MonthlyAvgTemp";
    const attribute_rain = "MonthlyAvgPreciptation";
    const attribute_wind_dir = "MonthlyWindDirection";
    const mixColors = (colorA, colorB, mix = 0.5) => {
        // Use d3's interpolateRgb to get an interpolator between the two colors
        const interpolate = interpolateRgb(colorA, colorB);
        // mix is a value between 0 and 1, where 0 will be colorA, 1 will be colorB and 0.5 a 50-50 mix
        return interpolate(mix);
    };
    useEffect(() => {
        let newMap = changeDataMap();
        const newBarChartData = [];

        setDataMap(newMap);

        newMap.forEach((value, stateName) => {
            const tempLabel = tempLegendLabels[parseInt(value[3], 10)-1];
            const rainLabel = rainLegendLabels[parseInt(value[4], 10)-1];
            const key = `${tempLabel}-${rainLabel}`;
            const color = mixColors(
                tempLegendColors[parseInt(value[3], 10)-1],
                rainLegendColors[parseInt(value[4], 10)-1],
            );
            let barData = newBarChartData.find(d => d.name === key);
            if (!barData) {
                barData = { name: key, value: 0, color: color };
                newBarChartData.push(barData);
            }
            barData.value++;
        });

        setBarChartData(newBarChartData);
    }, [month]);

    const changeDataMap = () => {
        const newMap = new Map();
        let max_temp = -100;
        let min_temp = 100;
        let max_rain = -100;
        let min_rain = 100;
        statesInfo.forEach((d) => {
            if (d.MONTH == month) {
                newMap.set(AbbrToFull[d.STATE], [d[attribute_temp], d[attribute_rain], d[attribute_wind_dir],
                    d["MonthlyAvgTemp_scale"], d["MonthlyAvgPrec_scale"]]);
                max_temp = Math.max(max_temp, d[attribute_temp]);
                min_temp = Math.min(min_temp, d[attribute_temp]);
                max_rain = Math.max(max_rain, d[attribute_rain]);
                min_rain = Math.min(min_rain, d[attribute_rain]);
            }
        });
        setMaxValue_temp(Number(max_temp).toFixed(2));
        setMinValue_temp(Number(min_temp).toFixed(2));
        setMaxValue_rain(Number(max_rain).toFixed(2));
        setMinValue_rain(Number(min_rain).toFixed(2));
        return newMap;
    };


    const handleMonthChange = (event) => {
        setMonth(event.target.value);
        setShowChart(false);
    };

    const handleMouseOver = (e, data) => {
        setStateTemp(data[0]);
        setStateRain(data[1]);
    };


    const temperatureColorScale = scaleSequential(interpolateReds).domain([
        minValue_temp,
        maxValue_temp,
    ]);

    const rainfallColorScale = scaleSequential(interpolateBlues).domain([
        minValue_rain,
        maxValue_rain,
    ]);

    const months = Array.from(Array(12), (_, i) => i + 1);

    return (
        <Box sx={{ m: '5em auto' }}>
            <Box display="flex" alignItems="center" justifyContent="center">
                <FormControl sx={{ m: 2, minWidth: 120 }}>
                    <InputLabel>month</InputLabel>
                    <Select
                        value={month}
                        label="Month"
                        onChange={handleMonthChange}
                        autoWidth
                    >
                        {months.map((m, i) => {
                            return (
                                <MenuItem key={i} value={m}>
                                    {m}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                <Typography>{`Temperature : ${stateTemp}   Precipitation: ${stateRain} `}</Typography>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="center">
                <svg width={width} height={height}>
                    <g className="marks4">
                        {dataMap
                            ? states.features.map((feature) => {
                                const data = dataMap.get(
                                    feature.properties.name
                                );
                                const centroid = path.centroid(feature) ? path.centroid(feature) : [0, 0];
                                const windDirection = data ? data[2] : 0;
                                // console.log(centroid);
                                const color = mixColors(
                                    tempLegendColors[parseInt(data ? data[3] : 1, 10)-1],
                                    rainLegendColors[parseInt(data ? data[4] : 1, 10)-1],
                                );
                                // console.log(color, tempLegendColors[parseInt(data ? data[3] : 1, 10)-1], rainLegendColors[parseInt(data ? data[4] : 1, 10)-1]);

                                return (
                                    <g key={feature.id}>
                                        <path
                                            className="states"
                                            key={feature.id}
                                            d={path(feature)}
                                            fill={color}
                                            onMouseOver={(e) =>
                                                handleMouseOver(e, [tempLegendLabels[parseInt(data ? data[3] : 1, 10)-1], rainLegendLabels[parseInt(data ? data[4] : 1, 10)-1]])
                                            }
                                        />
                                        <text
                                            x={centroid[0]}
                                            y={centroid[1]}
                                            fontSize="18"
                                            transform={`rotate(${windDirection}, ${centroid[0]}, ${centroid[1]})`}
                                        >
                                            &#x2B05;
                                        </text>
                                    </g>
                                );
                            })
                            : states.features.map((feature) => {
                                return (
                                    <path
                                        className="states"
                                        key={feature.id}
                                        d={path(feature)}
                                    />
                                );
                            })}
                        <path className="interiors4" d={path(interiors)} />
                    </g>
                </svg>
                <Legend colors={allColors} labels={allLabels} />
            </Box>
            <Box display="flex" alignItems="center" justifyContent="left" flexDirection="row">
                <Legend colors={tempLegendColors} labels={tempLegendLabels} />
                <Legend colors={rainLegendColors} labels={rainLegendLabels} />
            </Box>
            <button onClick={() => setShowChart(true)}>Generate Chart</button>
            {showChart && <BarChart data={barChartData} />}
        </Box>
    );
};

export default USAClimant;
