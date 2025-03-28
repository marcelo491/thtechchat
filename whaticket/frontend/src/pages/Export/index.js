import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Box, Checkbox, FormControl, ListItemText } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { ChevronLeft } from '@material-ui/icons';
import jsPDF from 'jspdf';

import Container from "@material-ui/core/Container";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        overflowY: 'scroll',
        padding: theme.spacing(1),
        ...theme.scrollbarStyles,
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0',
        minHeight: '48px',
        '&:hover': {
            backgroundColor: 'transparent',
            cursor: 'default',
        },
    },
}));

const Export = () => {
    const classes = useStyles();
    const history = useHistory();
    const { user } = useContext(AuthContext);
    const { queues } = user;

    const [exportLoading, setExportLoading] = useState(false);

    const [filterData, setFilterData] = useState({
        dateStart: new Date().toISOString().split('T')[0],
        dateEnd: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        queueId: null,
        status: null,
    });

    const handleExport = async (format) => {
        setExportLoading(true);
        try {
            const response = await api.post(`/report/tickets`, {
                dateStart: filterData.dateStart,
                dateEnd: filterData.dateEnd,
                queueId: filterData.queueId,
                status: filterData.status,
            });

            const parsedTickets = response.data;
            if (!parsedTickets.length) {
                toast.info('Nenhum ticket encontrado');
                return;
            }

            if (format === 'csv') {
                exportToCSV(parsedTickets);
            } else if (format === 'pdf') {
                exportToPDF(parsedTickets);
            }
        } catch (error) {
            console.log(error);
            toast.error('Erro ao exportar relatório');
        } finally {
            setExportLoading(false);
        }
    }

    const exportToCSV = (tickets) => {
        const translatedHeaders = {
            id: "ID",
            contactName: "Nome",
            contactNumber: "Número",
            createdAt: "Criado em",
            startedAt: "Iniciado em",
            queuedAt: "Em Fila",
            ratingAt: "Avaliação em",
            rated: "Avaliado",
            status: "Status",
            user: "Usuário",
            queue: "Fila",
            queueId: "ID da Fila",
            connection: "Conexão",
            connectionId: "ID da Conexão",
            firstSentMessageAt: "Primeira Mensagem em",
            resolvedAt: "Resolvido em",
            isNewContact: "Novo Contato",
            tags: "Tags"
        };

        const rows = tickets.map(ticket =>
            Object.entries(ticket).map(([key, value]) => {
                const header = translatedHeaders[key];
                const stringValue = value !== null ? String(value).replace(/"/g, '""') : "N/A"; // Substitui 'null' por 'N/A'
                return `"${header}: ${stringValue}"`;
            }).join('\n')
        );

        const csv = rows.join('\n\n'); // Adiciona uma linha em branco entre os registros

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets-${new Date().toDateString()}.csv`;
        a.click();
    }

    const exportToPDF = (tickets) => {
        const doc = new jsPDF();

        tickets.forEach(ticket => {
            const lineHeight = 10;
            const labelX = 20;
            const valueX = 80;
            let currentY = 20;

            doc.setFontSize(12);

            const printField = (label, value) => {
                doc.setTextColor(0, 51, 102); // Cor do texto para o rótulo
                doc.text(label, labelX, currentY);
                doc.setTextColor(0, 0, 0); // Cor do texto para o valor
                doc.text(value, valueX, currentY);
                currentY += lineHeight;
            };

            printField("ID:", String(ticket.id));
            printField("Nome:", ticket.contactName);
            printField("Número:", ticket.contactNumber);
            printField("Criado em:", ticket.createdAt !== null ? ticket.createdAt : "N/A");
            printField("Iniciado em:", ticket.startedAt !== null ? ticket.startedAt : "N/A");
            printField("Fila:", ticket.queue !== null ? ticket.queue : "N/A");
            printField("Avaliação em:", ticket.ratingAt !== null ? ticket.ratingAt : "N/A");
            printField("Avaliado:", ticket.rated !== null ? String(ticket.rated) : "N/A");
            printField("Status:", ticket.status);
            printField("Usuário:", ticket.user);
            printField("ID da Fila:", String(ticket.queueId));
            printField("Conexão:", ticket.connection);
            printField("ID da Conexão:", String(ticket.connectionId));
            printField("Primeira Mensagem em:", ticket.firstSentMessageAt !== null ? ticket.firstSentMessageAt : "N/A");
            printField("Resolvido em:", ticket.resolvedAt !== null ? ticket.resolvedAt : "N/A");
            printField("Novo Contato:", String(ticket.isNewContact));
            printField("Tags:", ticket.tags !== null ? ticket.tags : "N/A");

            doc.addPage(); // Adiciona uma nova página para o próximo ticket
        });

        doc.save(`tickets-${new Date().toDateString()}.pdf`);
    }

    const handleBack = () => {
        history.goBack();
    };

    return (
        <Container className={classes.mainContainer}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '50px',
                }}
            >
                <div className={classes.toolbarIcon}>
                    <IconButton
                        onClick={handleBack}
                        style={{
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        }}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'transparent !important',
                                boxShadow: 'none !important',
                            },
                        }}
                    >
                        <ChevronLeft />
                        <span style={{ fontSize: '1rem' }}>Voltar</span>
                    </IconButton>
                </div>
            </Box>
            <MainHeader>

                <Title>Exportar relatórios</Title>

                <MainHeaderButtonsWrapper>

                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper className={classes.mainPaper} variant="outlined">
                <div className={'flex flex-column'}>
                    <div className={'flex items-center justify-between gap-2'}>
                        <TextField
                            onChange={(event) => setFilterData({
                                ...filterData,
                                dateStart: event.target.value
                            })}
                            type="date"
                            fullWidth={true}
                            label={i18n.t("dashboard.date.initialDate")}
                            margin="normal"
                            variant="outlined"
                            value={filterData.dateStart}
                        />

                        <TextField
                            onChange={(event) =>
                                setFilterData({
                                    ...filterData,
                                    dateEnd: event.target.value
                                })}
                            fullWidth={true}
                            type="date"
                            margin="normal"
                            variant="outlined"
                            label={i18n.t("dashboard.date.finalDate")}
                            value={filterData.dateEnd}
                        />
                        <FormControl
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            className={classes.formControl}
                        >
                            <Select
                                displayEmpty
                                variant="outlined"
                                margin="normal"
                                fullWidth={true}
                                value={filterData.queueId}
                                onChange={(e) => setFilterData({
                                    ...filterData,
                                    queueId: e.target.value
                                })}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left",
                                    },
                                    transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left",
                                    },
                                    getContentAnchorEl: null,
                                }}
                                renderValue={() => queues?.find(queue => queue.id === filterData.queueId)?.name || "Todas filas"}
                            >
                                <MenuItem value={null}><Checkbox checked={!filterData.queueId} />
                                    Todas as filas
                                </MenuItem>
                                {queues?.length > 0 &&
                                    queues.map(queue => (
                                        <MenuItem dense key={queue.id} value={queue.id}>
                                            <Checkbox
                                                style={{
                                                    color: queue.color,
                                                }}
                                                size="small"
                                                color="primary"
                                                checked={filterData.queueId === queue.id}
                                            />
                                            <ListItemText primary={queue.name} />
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        <FormControl
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            className={classes.formControl}
                        >
                            <Select
                                margin="normal"
                                displayEmpty
                                fullWidth={true}
                                variant="outlined"
                                value={filterData.status}
                                onChange={(e) => setFilterData({
                                    ...filterData,
                                    status: e.target.value
                                })}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: "bottom",
                                        horizontal: "left",
                                    },
                                    transformOrigin: {
                                        vertical: "top",
                                        horizontal: "left",
                                    },
                                    getContentAnchorEl: null,
                                }}
                                renderValue={() => {
                                    switch (filterData.status) {
                                        case "open":
                                            return "Abertos";
                                        case "closed":
                                            return "Fechados";
                                        case "pending":
                                            return "Pendentes";
                                        default:
                                            return "Todos Status";
                                    }
                                }}
                            >
                                <MenuItem value={null}><Checkbox checked={!filterData.status} />
                                    Todos os status
                                </MenuItem>
                                <MenuItem dense key="open" value={"open"}>
                                    <Checkbox
                                        style={{
                                            color: 'green',
                                        }}
                                        size="small"
                                        color="primary"
                                        checked={filterData.status === "open"}
                                    />
                                    <ListItemText primary={"Abertos"} />
                                </MenuItem>
                                <MenuItem dense key="closed" value={"closed"}>
                                    <Checkbox
                                        style={{
                                            color: 'red',
                                        }}
                                        size="small"
                                        color="primary"
                                        checked={filterData.status === "closed"}
                                    />
                                    <ListItemText primary={"Fechados"} />
                                </MenuItem>

                                <MenuItem dense key={"pending"} value={"pending"}>
                                    <Checkbox
                                        style={{
                                            color: 'yellow',
                                        }}
                                        size="small"
                                        color="primary"
                                        checked={filterData.status === "pending"}
                                    />
                                    <ListItemText primary={"Pendentes"} />
                                </MenuItem>

                            </Select>
                        </FormControl>
                    </div>

                    <Button
                        disabled={exportLoading}
                        onClick={() => handleExport('csv')}
                        color="primary"
                        variant="contained"
                    >
                        Exportar Tickets (CSV)
                    </Button>
                    <Button
                        disabled={exportLoading}
                        onClick={() => handleExport('pdf')}
                        color="secondary"
                        variant="contained"
                        style={{ marginLeft: '10px' }}
                    >
                        Exportar Tickets (PDF)
                    </Button>
                </div>
            </Paper>

        </Container>
    );
};

export default Export;
