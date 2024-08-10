import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TextField, IconButton, Grid, Paper, Typography } from '@mui/material';
import { CalendarToday, AccessTime, SyncAlt, Link, DarkMode as DarkModeIcon } from '@mui/icons-material';

const UTCToISTConverter = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [utcTime, setUTCTime] = useState(moment().utc().format('HH:mm'));
    const [istTime, setISTTime] = useState(moment().utcOffset(330).format('HH:mm')); // Default IST time
    const [timezones, setTimezones] = useState([
        { id: 'utc', name: 'UTC', offset: 0, time: utcTime },
        { id: 'ist', name: 'IST', offset: 5.5, time: istTime },
    ]);
    const [darkMode, setDarkMode] = useState(false);

    // Update IST time whenever UTC time changes
    useEffect(() => {
        const newISTTime = moment.tz(`${moment(selectedDate).format('YYYY-MM-DD')} ${utcTime}`, 'UTC')
            .add(5.5, 'hours')
            .format('HH:mm');
        setISTTime(newISTTime);
    }, [utcTime, selectedDate]);

    // Update UTC time whenever IST time changes
    useEffect(() => {
        const newUTCTime = moment.tz(`${moment(selectedDate).format('YYYY-MM-DD')} ${istTime}`, 'Asia/Kolkata')
            .subtract(5.5, 'hours')
            .format('HH:mm');
        setUTCTime(newUTCTime);
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

    const handleSliderChange = (event, timezone) => {
        const sliderValue = event.target.value;
        const hours = Math.floor(sliderValue / 60);
        const minutes = sliderValue % 60;
        const newTime = moment().hours(hours).minutes(minutes).format('HH:mm');
        
        if (timezone === 'utc') {
            handleUTCTimeChange(newTime);
        } else if (timezone === 'ist') {
            handleISTTimeChange(newTime);
        }
    };

    const getSliderValue = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
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
        }, 60000); // Update every minute to keep the current time accurate

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    const containerStyle = {
        padding: '20px',
        backgroundColor: darkMode ? '#121212' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        minHeight: '100vh',
    };

    const paperStyle = {
        padding: '20px',
        marginTop: '20px',
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
    };

    return (
        <div style={containerStyle}>
            <Typography variant="h4" gutterBottom>
                UTC to IST Converter
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Add Time Zone, City or Town"
                        variant="outlined"
                        fullWidth
                        style={{ color: darkMode ? '#ffffff' : '#000000' }}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="MMMM d, yyyy"
                        className="form-control"
                        customInput={<TextField style={{ color: darkMode ? '#ffffff' : '#000000' }} />}
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

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="timezones">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {timezones.map((timezone, index) => (
                                <Draggable key={timezone.id} draggableId={timezone.id} index={index}>
                                    {(provided) => (
                                        <Paper
                                            elevation={3}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{ ...paperStyle, ...provided.draggableProps.style }}
                                        >
                                            <Grid container spacing={3}>
                                                <Grid item xs={6}>
                                                    <Typography variant="h6">{timezone.name}</Typography>
                                                    <Typography variant="subtitle1">
                                                        {timezone.name === 'UTC' 
                                                            ? 'Universal Time Coordinated' 
                                                            : 'India Standard Time'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} container justifyContent="flex-end" alignItems="center">
                                                    {timezone.name === 'UTC' ? (
                                                        <>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1439" // Total minutes in a day
                                                                value={getSliderValue(utcTime)}
                                                                onChange={(e) => handleSliderChange(e, 'utc')}
                                                                style={{ width: '100%' }}
                                                            />
                                                            <TextField
                                                                type="time"
                                                                value={utcTime}
                                                                onChange={(e) => handleUTCTimeChange(e.target.value)}
                                                                inputProps={{ step: 300 }} // 5 min step
                                                                style={{ fontSize: '24px', marginLeft: '10px', color: darkMode ? '#ffffff' : '#000000' }}
                                                            />
                                                            <Typography variant="subtitle1" style={{ marginTop: '10px' }}>
                                                                UTC Time: {utcTime}
                                                            </Typography>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1439" // Total minutes in a day
                                                                value={getSliderValue(istTime)}
                                                                onChange={(e) => handleSliderChange(e, 'ist')}
                                                                style={{ width: '100%' }}
                                                            />
                                                            <Typography variant="h4" style={{ marginLeft: '10px' }}>{istTime}</Typography>
                                                            <Typography variant="subtitle1" style={{ marginTop: '10px' }}>
                                                                IST Time: {istTime}
                                                            </Typography>
                                                        </>
                                                    )}
                                                    <Typography variant="subtitle1" style={{ marginLeft: '10px' }}>
                                                        GMT {timezone.offset === 0 ? '+0' : `+${timezone.offset}`}
                                                        <br />
                                                        {moment(selectedDate).format('ddd, MMM D')}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>
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
