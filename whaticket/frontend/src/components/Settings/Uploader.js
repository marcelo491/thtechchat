import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import {
  makeStyles,
  Grid,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@material-ui/core";
import { FormControlLabel, Switch } from "@material-ui/core";

import { toast } from 'react-toastify';
import ButtonWithSpinner from "../ButtonWithSpinner";
import { grey } from "@material-ui/core/colors";
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  fullWidth: {
    width: "100%",
    maxWidth: "400px", // Definir largura máxima
    margin: "0 auto",  // Centralizar
  },
  selectButton: {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#fff",  // Cor de fundo branca
    color: "#333",  // Texto preto fosco
    borderRadius: "8px",  // Bordas arredondadas suaves
    cursor: "pointer",
    marginBottom: "20px",
    border: "1px solid #ccc",  // Borda suave
    "&:hover": {
      backgroundColor: "#f0f0f0",  // Cor de fundo quando o botão é focado ou clicado
    },
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  optionButton: {
    width: "100%",
    marginBottom: "10px",
  },
  submitButton: {
    marginTop: 5,  // Ajuste o espaçamento superior
    marginBottom: 5, // Ajuste o espaçamento inferior
    width: "100%",   // Definir largura do botão
    maxWidth: "400px", // Definir largura máxima do botão
    margin: "0 auto",  // Centralizar o botão
  },
  centeredTextContainer: {
    width: "100%",
    backgroundColor: "#f4f6f8", // Cor de fundo clara
    padding: "15px", // Espaçamento interno
    borderRadius: "8px", // Borda arredondada
    textAlign: "center", // Centralizar o texto
    marginBottom: theme.spacing(3), // Espaçamento abaixo
  },
  centeredText: {
    color: theme.palette.primary.main,
    fontWeight: "bold", // Texto em negrito
    fontSize: "18px", // Tamanho da fonte
  },
  previewImageContainer: {
    position: "relative",
    marginTop: 15,
    width: "100%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#fff", // Fundo branco por padrão
    borderRadius: 8,
  },
  previewImageDarkBackground: {
    backgroundColor: "#1F2044",  // Fundo azul para logos com texto claro
  },
  previewImage: {
    width: "100%",
    maxHeight: "250px",
    objectFit: "contain",
    borderRadius: 8,
    padding: theme.spacing(1),
    maxWidth: "400px",
    margin: "0 auto",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "50%",
    cursor: "pointer",
  },
}));

const Uploader = () => {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // Para visualização da imagem
  const [selectedOption, setSelectedOption] = useState("");
  const [isDarkBackground, setIsDarkBackground] = useState(false); // Estado para controlar o fundo
  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar o modal
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const [selectedFileName, setSelectedFileName] = useState('');

  const options = [
    { value: 'login', label: 'Logo de Login' },
    { value: 'signup', label: 'Logo de Registro' },
    { value: 'banner-login', label: 'Banner - Tela de Login' },
    { value: 'banner-signup', label: 'Banner - Tela de Registro' },
    //{ value: 'logo-reset', label: 'Logo - Tela de Redefinição de Senha' },
    { value: 'interno', label: 'Logotipo Interno' },
    { value: 'favicon', label: 'Favicon.Ico' },
    { value: 'favicon-256x256', label: 'Ícone 256x256' },
    { value: 'apple-touch-icon', label: 'Apple Touch Icon' }
  ];

  useEffect(() => {
    async function fetchData() {
      if (!user.super) {
        toast.error("Sem permissão para acessar!");
        setTimeout(() => {
          history.push(`/`)
        }, 500);
      }
    }
    fetchData();
  }, [history, user.super]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const allowedTypes = ["image/png", "image/x-icon", "image/svg+xml"];
    
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setSelectedFileName(selectedFile.name);
      setFilePreview(URL.createObjectURL(selectedFile)); // Visualização da imagem
    } else {
      setFile(null);
      setSelectedFileName(null);
      setFilePreview(null);
      toast.error("Use somente arquivos em formato PNG, ICO ou SVG!");
    }
  };

  const handleDeleteImage = () => {
    setFile(null);
    setSelectedFileName(null);
    setFilePreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.warn("Escolha um arquivo!");
      return;
    }

    if (!selectedOption) {
      toast.warn("Escolha um destino!");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post(`/settings/media-upload?ref=${selectedOption}`, formData);

      if (response.data.mensagem === 'Arquivo Anexado') {
        toast.success("Arquivo enviado com sucesso!");
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Funções para abrir e fechar o modal
  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSelectOption = (option) => {
    setSelectedOption(option.value);
    setModalOpen(false); // Fecha o modal ao selecionar a opção
  };

  return (
    <>
      <Grid spacing={3} container>
        <Grid item xs={12} className={classes.centeredTextContainer}>
          <div className={classes.centeredText}>
            Logotipos / Ícones
          </div>
        </Grid>

        <form onSubmit={handleSubmit} className={classes.fullWidth}>
          <Grid item xs={12} sm={12} md={12} style={{ display: 'flex' }}>
            {/* Botão para abrir o modal */}
            <Button onClick={handleOpenModal} className={classes.selectButton}>
              {selectedOption ? `Opção Selecionada: ${selectedOption}` : "Escolha uma opção"}
            </Button>
          </Grid>

          {/* Modal para selecionar a opção */}
          <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
            <DialogTitle>Escolha uma Opção</DialogTitle>
            <DialogContent className={classes.dialogContent}>
              {options.map((option) => (
                <Button
                  key={option.value}
                  className={classes.optionButton}
                  variant="outlined"
                  onClick={() => handleSelectOption(option)}
                >
                  {option.label}
                </Button>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Cancelar
              </Button>
            </DialogActions>
          </Dialog>

          <Grid item xs={12} sm={12} md={12} style={{ display: 'flex' }}>
  <div className={classes.fullWidth}>
    <input
      type="file"
      onChange={handleFileChange}
      className={classes.fileInput}
      id="file-upload"
      style={{ display: 'none' }} // Esconder o input padrão
    />
    <label 
      htmlFor="file-upload" 
      className={classes.fileInputLabel} 
      style={{
        display: 'inline-block',
        backgroundColor: "#7c7c7c",  // Fundo cinza
        color: "#fff",  // Texto branco
        padding: "12px 16px",  // Espaçamento interno
        borderRadius: "4px",  // Bordas arredondadas
        cursor: "pointer",  // Cursor para indicar clique
        textAlign: "center", 
        width: "100%", 
        maxWidth: "400px",  // Definir largura máxima
      }}>
      {selectedFileName ? selectedFileName : 'Escolher imagem em PNG'}
    </label>
  </div>
</Grid>


          {filePreview && (
            <>
              <Grid item xs={12} sm={12} md={12} style={{ display: 'flex', justifyContent: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDarkBackground}
                      onChange={() => setIsDarkBackground(!isDarkBackground)}
                      name="backgroundSwitch"
                      color="primary"
                    />
                  }
                  label={isDarkBackground ? "Fundo Escuro" : "Fundo Claro"}
                />
              </Grid>

              <Grid item xs={12} sm={12} md={12} style={{ display: 'flex' }}>
                <div className={`${classes.previewImageContainer} ${isDarkBackground ? classes.previewImageDarkBackground : ''}`}>
                  <img
                    src={filePreview}
                    alt="Pré-visualização do Arquivo"
                    className={classes.previewImage}
                  />
                  <IconButton
                    className={classes.deleteButton}
                    onClick={handleDeleteImage}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={12} md={12} style={{ display: 'flex' }}>
            <ButtonWithSpinner
              type="submit"
              className={`${classes.fullWidth} ${classes.submitButton}`}
              variant="contained"
              color="primary"
            >
              ENVIAR ARQUIVO
            </ButtonWithSpinner>
          </Grid>
        </form>
      </Grid>
    </>
  );
};

export default Uploader;
