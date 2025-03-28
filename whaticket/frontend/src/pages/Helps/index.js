import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
} from "@material-ui/core";
import { ChevronLeft as ChevronLeftIcon } from "@material-ui/icons";
import { ChevronRight } from "lucide-react";
import { Book } from "lucide-react"; // Ícone para Manual do Usuário
import { FileText } from "lucide-react"; // Ícone para Contador de Ajuda
import { Info } from "lucide-react"; // Ícone para Informações
import { User } from "lucide-react"; // Ícone para Usuário
import { Pagination } from "@mui/material"; // Adicionado para paginação
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import useHelps from "../../hooks/useHelps";
import hepl from "../../assets/hepl.png";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    padding: theme.spacing(2),
    overflowX: "hidden",
    width: "100%",
  },
  leftContainer: {
  backgroundColor: "#fff",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  textAlign: "center",
  minHeight: "300px", // Altura mínima para manter o layout consistente
  maxHeight: "450px", // Altura máxima (se necessário)
  overflow: "auto", // Adiciona barra de rolagem caso o conteúdo ultrapasse
  maxWidth: "350px", // Limita a largura
  margin: "0 auto", // Centraliza horizontalmente
},
  rightContainer: {
  padding: theme.spacing(3),
  textAlign: "left",
  overflow: "hidden", // Remova a barra de rolagem
  height: "auto",     // Ajuste automático de altura
},
  gridContainer: {
    display: "flex",
    alignItems: "stretch",
    maxWidth: "100%",
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    marginTop: theme.spacing(2),
  },
  manualIcon: {
    marginBottom: theme.spacing(1),
    color: "#696CFF",
    fontSize: "40px",
  },
  infoIcon: {
    color: "#696CFF",
    fontSize: "30px",
    marginBottom: theme.spacing(1),
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.5rem",
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  description: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
  },
  listItemPaper: {
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    transition: "box-shadow 0.3s",
    "&:hover": {
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
    },
  },

  drawerPaper: {
    width: "400px",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    justifyContent: "space-between",
  },
  videoFrame: {
    width: "100%",
    height: "300px",
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    position: "relative",
    boxShadow: theme.shadows[2],
  },
  paginationContainer: {
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(2),
},

  noDataMessage: {
    textAlign: "center",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(4),
  },
}));

const Helps = () => {
  const classes = useStyles();
  const [records, setRecords] = useState([]);
  const { list } = useHelps();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Quantidade de itens por página

  useEffect(() => {
    async function fetchData() {
      const helps = await list();
      setRecords(helps);
    }
    fetchData();
  }, [list]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedItem(null);
  };

  const truncateDescription = (description, maxLength = 50) => {
    if (description.length > maxLength) {
      return `${description.substring(0, maxLength)}...`;
    }
    return description;
  };

const handlePageChange = (_, newPage) => {
    setCurrentPage(newPage);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = records.slice(indexOfFirstItem, indexOfLastItem);


  return (
  <MainContainer>
    <MainHeader>
      <Title>Central de Ajuda</Title>
      <MainHeaderButtonsWrapper />
    </MainHeader>

    <Grid
      container
      spacing={4}
      className={`${classes.mainContainer} ${classes.gridContainer}`}
    >
      {/* Manual do Usuário */}
      <Grid item xs={12} md={4} className={classes.leftContainer}>
        {/* Ícone do Manual */}
        <Book className={classes.manualIcon} size={40} />
        <Typography variant="h5" gutterBottom className={classes.title}>
          Manual do Usuário
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Última atualização há 6 meses
        </Typography>

        {/* Contador de Ajuda */}
<div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "8px" }}>
  <FileText className={classes.icon} size={22} style={{ marginRight: 8, color: "#696CFF" }} />
  <Typography variant="body2" style={{ color: "#696CFF" }}>
    {records.length}
  </Typography>
</div>


        {/* Divisor */}
        <div
          style={{
            borderBottom: "1px solid #E0E0E0",
            margin: "16px 0",
            width: "100%",
          }}
        ></div>

        {/* Informação */}
        <Typography variant="body2" color="textSecondary" align="center">
          "Este manual foi criado para auxiliar nossos usuários a resolver as dúvidas mais comuns sobre a utilização do nosso sistema SaaS."
        </Typography>

        {/* Usuário */}
<div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
  <User className={classes.icon} size={22} style={{ marginRight: 8, color: "#696CFF" }} />
  <Typography variant="body2" color="textSecondary">
            CRM Deveopne
          </Typography>
        </div>

        {/* Imagem do Usuário */}
        <img
          className={classes.userImage}
          src={hepl}
          alt="Manual do Usuário"
        />
      </Grid>

      {/* Lista de Itens */}
      <Grid item xs={12} md={8} className={classes.rightContainer}>
        {records.length > 0 ? (
          <List>
  {currentItems.map((item, index) => (
    <Paper
      key={index}
      className={classes.listItemPaper}
      onClick={() => handleSelectItem(item)}
    >
      <ListItem>
        <FileText style={{ marginRight: 15, color: "#696CFF" }} size={22} />
        <ListItemText
          primary={item.title}
          secondary={truncateDescription(item.description)}
        />
        <ChevronRight style={{ marginLeft: 15, color: "#696CFF" }} size={22} />
      </ListItem>
    </Paper>
  ))}
</List>

        ) : (
  <Typography variant="body1" className={classes.noDataMessage}>
    Nenhuma lista de ajuda disponível.
  </Typography>
)}
<div className={classes.paginationContainer}>
  <Pagination
    count={Math.ceil(records.length / itemsPerPage)}
    page={currentPage}
    onChange={handlePageChange}
    sx={{
      "& .Mui-selected": {
        backgroundColor: "#696CFF", // Cor do botão selecionado
        color: "#FFFFFF",          // Cor do texto do botão selecionado
        "&:hover": {
          backgroundColor: "#585CFF", // Cor ao passar o mouse sobre o botão selecionado
        },
      },
      "& .MuiPaginationItem-root": {
        "&:hover": {
          backgroundColor: "#E0E0FF", // Cor ao passar o mouse nos botões não selecionados
        },
      },
    }}
  />
</div>
</Grid>
</Grid>


    {/* Drawer com Detalhes */}
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={handleCloseDrawer}
      classes={{ paper: classes.drawerPaper }}
    >
      <div className={classes.drawerHeader}>
        <Typography variant="h6">
          {selectedItem ? selectedItem.title : "Detalhes"}
        </Typography>
        <IconButton onClick={handleCloseDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      {selectedItem && (
        <div style={{ padding: "16px" }}>
          <Typography variant="body1" gutterBottom>
            {selectedItem.description}
          </Typography>
          <div className={classes.videoFrame}>
            <iframe
              src={`https://www.youtube.com/embed/${selectedItem.video}`}
              title={selectedItem.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
        </div>
      )}
    </Drawer>
  </MainContainer>
 );
};

export default Helps;
