import React, { useState, useEffect } from "react";
import { makeStyles, TextField, Grid, Container } from "@material-ui/core";
import { Formik, Form, FastField, FieldArray } from "formik";
import { isArray } from "lodash";
import NumberFormat from "react-number-format";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  fullWidth: {
    width: "100%",
  },
  textfield: {
    width: "100%",
  },
  row: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  control: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  buttonContainer: {
    textAlign: "right",
    padding: theme.spacing(1),
  },
}));

function SchedulesForm(props) {
  const { initialValues, onSubmit, loading, labelSaveButton } = props;
  const classes = useStyles();

  // Adicionando os campos de almoço (lunchTime) e início pós-almoço (afterLunchTime)
  const [schedules, setSchedules] = useState([
    { weekday: "Segunda-feira", weekdayEn: "monday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
    { weekday: "Terça-feira",   weekdayEn: "tuesday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
    { weekday: "Quarta-feira",  weekdayEn: "wednesday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
    { weekday: "Quinta-feira",  weekdayEn: "thursday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
    { weekday: "Sexta-feira",   weekdayEn: "friday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
    { weekday: "Sábado",        weekdayEn: "saturday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
    { weekday: "Domingo",       weekdayEn: "sunday", startTime: "", endTime: "", lunchTime: "", afterLunchTime: "" },
  ]);

  useEffect(() => {
    if (isArray(initialValues) && initialValues.length > 0) {
      setSchedules(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const handleSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Formik
      enableReinitialize
      className={classes.fullWidth}
      initialValues={{ schedules }}
      onSubmit={({ schedules }) =>
        setTimeout(() => {
          handleSubmit(schedules);
        }, 500)
      }
    >
      {({ values }) => (
        <Form className={classes.fullWidth}>
          <FieldArray
            name="schedules"
            render={(arrayHelpers) => (
              <Grid spacing={4} container>
                {values.schedules.map((item, index) => {
                  return (
                    <Container key={index}>
                      {/* Campo para o dia da semana */}
                      <FastField
                        as={TextField}
                        label="Dia da Semana"
                        name={`schedules[${index}].weekday`}
                        disabled
                        variant="outlined"
                        style={{ marginRight: "3.2%", width: "30%" }}
                        margin="dense"
                      />

                      {/* Horário de Início */}
                      <FastField name={`schedules[${index}].startTime`}>
                        {({ field }) => (
                          <NumberFormat
                            label="Horário Inicial"
                            {...field}
                            variant="outlined"
                            margin="dense"
                            customInput={TextField}
                            format="##:##"
                            style={{ marginRight: "3.2%", width: "30%" }}
                          />
                        )}
                      </FastField>

                      {/* Horário de Término */}
                      <FastField name={`schedules[${index}].endTime`}>
                        {({ field }) => (
                          <NumberFormat
                            label="Horário Final"
                            {...field}
                            variant="outlined"
                            margin="dense"
                            customInput={TextField}
                            format="##:##"
                            style={{ marginRight: "3.2%", width: "30%" }}
                          />
                        )}
                      </FastField>

                      {/* Horário do Almoço */}
                      <FastField name={`schedules[${index}].lunchTime`}>
                        {({ field }) => (
                          <NumberFormat
                            label="Hora do Almoço"
                            {...field}
                            variant="outlined"
                            margin="dense"
                            customInput={TextField}
                            format="##:##"
                            style={{ marginRight: "3.2%", width: "30%", marginTop: "8px" }}
                          />
                        )}
                      </FastField>

                      {/* Início após o Almoço */}
                      <FastField name={`schedules[${index}].afterLunchTime`}>
                        {({ field }) => (
                          <NumberFormat
                            label="Início após Almoço"
                            {...field}
                            variant="outlined"
                            margin="dense"
                            customInput={TextField}
                            format="##:##"
                            style={{ marginRight: "3.2%", width: "30%", marginTop: "8px" }}
                          />
                        )}
                      </FastField>
                    </Container>
                  );
                })}
              </Grid>
            )}
          ></FieldArray>
          <div style={{ textAlign: "center", marginTop: "2%" }} className={classes.buttonContainer}>
            <ButtonWithSpinner
              loading={loading}
              type="submit"
              color="primary"
              variant="contained"
            >
              {labelSaveButton ?? "Salvar"}
            </ButtonWithSpinner>
          </div>
        </Form>
      )}
    </Formik>
  );
}

export default SchedulesForm;
