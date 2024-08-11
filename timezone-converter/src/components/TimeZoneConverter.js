import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TextField, IconButton, Grid, Paper, Typography, Button } from '@mui/material';
import { CalendarToday, AccessTime, SyncAlt, Link, DarkMode as DarkModeIcon } from '@mui/icons-material';
import '../App.css';

// Utility functions
const calculateTime = (baseTime, offset, format) => {
    return moment(baseTime).add(offset, 'hours').format(format);
};

const getSliderValue = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const TimezoneCard = ({ timezone, onSliderChange }) => (
    <Paper elevation={3} className="timezone-paper">
        <Grid container spacing={3}>
            <Grid item xs={6}>
                <Typography variant="h6">{timezone.name}</Typography>
                <Typography variant="subtitle1">
                    {timezone.name === 'UTC' ? 'Universal Time Coordinated' : timezone.name === 'IST' ? 'India Standard Time' : timezone.name}
                </Typography>
            </Grid>
            <Grid item xs={6} container justifyContent="flex-end" alignItems="center">
                <input
                    type="range"
                    min="0"
                    max="1439" // Total minutes in a day
                    value={getSliderValue(timezone.time)}
                    onChange={(e) => onSliderChange(e, timezone.id)}
                    className="time-slider"
                />
                <Typography variant="h4" className="time-value">{timezone.time}</Typography>
                <Typography variant="subtitle1" className="time-label">
                    {timezone.name} Time: {timezone.time}
                </Typography>
                <Typography variant="subtitle1" className="time-label">
                    GMT {timezone.offset === 0 ? '+0' : `+${timezone.offset}`}
                    <br />
                    {moment().format('ddd, MMM D')}
                </Typography>
            </Grid>
        </Grid>
    </Paper>
);

const UTCToISTConverter = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [utcTime, setUTCTime] = useState(moment().utc().format('HH:mm'));
    const [istTime, setISTTime] = useState(moment().utcOffset(330).format('HH:mm')); // Default IST time
    const [timezones, setTimezones] = useState([
        { id: 'utc', name: 'UTC', offset: 0, time: utcTime },
        { id: 'ist', name: 'IST', offset: 5.5, time: istTime },
    ]);
    const [darkMode, setDarkMode] = useState(false);
    const [newCity, setNewCity] = useState('');

    useEffect(() => {
        setISTTime(calculateTime(moment(selectedDate).format('YYYY-MM-DD') + ' ' + utcTime, 5.5, 'HH:mm'));
    }, [utcTime, selectedDate]);

    useEffect(() => {
        setUTCTime(calculateTime(moment(selectedDate).format('YYYY-MM-DD') + ' ' + istTime, -5.5, 'HH:mm'));
    }, [istTime, selectedDate]);

    useEffect(() => {
        setTimezones([
            { id: 'utc', name: 'UTC', offset: 0, time: utcTime },
            { id: 'ist', name: 'IST', offset: 5.5, time: istTime },
        ]);
    }, [utcTime, istTime, selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleUTCTimeChange = (newUTCTime) => {
        setUTCTime(newUTCTime);
    };

    const handleISTTimeChange = (newISTTime) => {
        setISTTime(newISTTime);
    };

    const handleSliderChange = (event, timezoneId) => {
        const sliderValue = event.target.value;
        const hours = Math.floor(sliderValue / 60);
        const minutes = sliderValue % 60;
        const newTime = moment().hours(hours).minutes(minutes).format('HH:mm');
        
        setTimezones(timezones.map(tz => 
            tz.id === timezoneId 
                ? { ...tz, time: newTime } 
                : tz
        ));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(timezones);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setTimezones(items);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setUTCTime(moment().utc().format('HH:mm'));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    const addCity = () => {
        if (newCity.trim()) {
            const currentTime = moment().tz(newCity.trim()).format('HH:mm');
            const offset = moment().tz(newCity.trim()).utcOffset() / 60;
            setTimezones([...timezones, { id: newCity.trim(), name: newCity.trim(), offset, time: currentTime }]);
            setNewCity('');
        }
    };

    return (
        <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
            <Typography variant="h4" gutterBottom>
                UTC to IST Converter
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} container spacing={2} alignItems="center">
                    <Grid item xs={6} sm={4}>
                        <TextField
                            label="Add Time Zone, City or Town"
                            variant="outlined"
                            fullWidth
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            className="input-field"
                        />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={addCity}
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            selected={selectedDate}
                            onChange={handleDateChange}
                            dateFormat="MMMM d, yyyy"
                            className="form-control"
                            customInput={<TextField className="input-field" />}
                            popperPlacement="bottom-end"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} container justifyContent="flex-end">
                        <IconButton onClick={toggleDarkMode}>
                            <DarkModeIcon />
                        </IconButton>
                        <IconButton><CalendarToday /></IconButton>
                        <IconButton><AccessTime /></IconButton>
                        <IconButton><SyncAlt /></IconButton>
                        <IconButton><Link /></IconButton>
                    </Grid>
                </Grid>
            </Grid>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="timezones">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {timezones.map((timezone, index) => (
                                <Draggable key={timezone.id} draggableId={timezone.id} index={index}>
                                    {(provided) => (
                                        <TimezoneCard
                                            timezone={timezone}
                                            onSliderChange={handleSliderChange}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default UTCToISTConverter;
