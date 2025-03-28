import React from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    width: "400px",
  },
  input: {
    marginBottom: "1rem",
    width: "100%",
  },
  button: {
    backgroundColor: "#6200ea",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#4500b5",
    },
  },
}));

const TaskModal = ({
  open,
  handleClose,
  task,
  setTask,
  onSave,
}) => {
  const classes = useStyles();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={classes.modal}
      aria-labelledby="task-modal-title"
    >
      <Box className={classes.modalContent}>
        <Typography variant="h6" id="task-modal-title" style={{ marginBottom: "1rem" }}>
          {task.id ? "Editar Tarefa" : "Nova Tarefa"}
        </Typography>
        <TextField
          label="Título"
          variant="outlined"
          className={classes.input}
          value={task.text}
          onChange={(e) => setTask({ ...task, text: e.target.value })}
        />
        <TextField
          label="Descrição"
          variant="outlined"
          className={classes.input}
          multiline
          rows={3}
          value={task.description}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />
        <Button variant="contained" className={classes.button} onClick={onSave}>
          Salvar
        </Button>
      </Box>
    </Modal>
  );
};

export default TaskModal;
