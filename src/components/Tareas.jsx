import useProyectos from "../hooks/useProyectos";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import Alerta from "./Alerta";
import Tarea from "./Tarea";
import formatearFecha from "../helpers/formatearFecha";
import useTareas from "../hooks/useTareas";
import useAuth from "../hooks/useAuth";

const Tareas = () => {
  const { proyecto, mostrarAlerta, alerta } = useProyectos();
  const { crearTarea, eliminarTarea, tareas } = useTareas();
  const { isDesktop } = useAuth();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("Baja");
  const [actualizarTareas, setActualizarTareas] = useState(false);
  const [fechaDeEntrega, setFechaDeEntrega] = useState("");
  const [opcionOrden, setOpcionOrden] = useState("estado"); // Por defecto, ordenar por fecha
  const [tareasOrdenadas, setTareasOrdenadas] = useState([]); // Array de tareas ordenadas

  useEffect(() => {
    if (!isOpen) {
      const partesFecha = formatearFecha(Date.now()).split("/");
      const fechaReordenada = [partesFecha[2], partesFecha[1], partesFecha[0]];
      mostrarAlerta({});
      setNombre("");
      setDescripcion("");
      setPrioridad("Baja");
      setFechaDeEntrega(fechaReordenada.join("-"));
    }
  }, [isOpen]);

  useEffect(() => {
    const partesFecha = formatearFecha(Date.now()).split("/");
    const fechaReordenada = [partesFecha[2], partesFecha[1], partesFecha[0]];
    setNombre("");
    setDescripcion("");
    setPrioridad("Baja");
    setFechaDeEntrega(fechaReordenada.join("-"));
    onClose();
  }, [actualizarTareas]);

  useEffect(() => {
    let tareasOrdenadas;
    if (opcionOrden === "fecha") {
      tareasOrdenadas = [...tareas].sort((a, b) => {
        const fechaEntregaA = new Date(a.fechaEntrega);
        const fechaEntregaB = new Date(b.fechaEntrega);
        return fechaEntregaA - fechaEntregaB;
      });
    } else if (opcionOrden === "estado") {
      tareasOrdenadas = [...tareas].sort((a, b) =>
        a.estado === b.estado ? 0 : a.estado ? 1 : -1
      );
    } else if (opcionOrden === "prioridad") {
      tareasOrdenadas = [...tareas].sort((a, b) => {
        const prioridadA = a.prioridad;
        const prioridadB = b.prioridad;
        // Asigna un valor numérico a cada prioridad para poder compararlas
        const prioridadValues = { Baja: 1, Media: 2, Alta: 3 };
        return prioridadValues[prioridadA] - prioridadValues[prioridadB];
      });
    }
    setTareasOrdenadas(tareasOrdenadas);
  }, [tareas, opcionOrden]);

  const handleCrear = async () => {
    try {
      if (
        [nombre, descripcion, prioridad].includes("") &&
        fechaDeEntrega.length < 10
      ) {
        mostrarAlerta({ msg: "Faltan campos por completar", error: true });
        return;
      }
      const datos = {
        nombre,
        descripcion,
        prioridad,
        proyecto: proyecto._id,
        fechaEntrega: fechaDeEntrega,
      };
      console.log(fechaDeEntrega);

      await crearTarea(datos);
      setActualizarTareas((actualizarTareas) => !actualizarTareas);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEliminarTarea = async (_id) => {
    try {
      const confirmacion = window.confirm(
        "¿Estás seguro de que deseas eliminar esta tarea?"
      );
      if (confirmacion) {
        await eliminarTarea(_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const { msg } = alerta;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size={`${isDesktop ? "5xl" : "xs"}`}
        backdrop="blur"
        placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Crear Tarea{" "}
              </ModalHeader>
              <ModalBody className="w-full">
                {msg && <Alerta alerta={alerta} />}
                <form className="bg-white py-10 px-5 w-full rounded-lg shadow" onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-5">
                    <label
                      className="text-gray-700 uppercase font-bold text-sm"
                      htmlFor="nombre">
                      Nombre Tarea
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                      placeholder="Nombre de la Tarea"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                      }}
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      className="text-gray-700 uppercase font-bold text-sm"
                      htmlFor="descripcion">
                      Descripcion de la tarea
                    </label>
                    <textarea
                      id="descripcion"
                      className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                      placeholder="Descripcion de la tarea..."
                      value={descripcion}
                      onChange={(e) => {
                        setDescripcion(e.target.value);
                      }}
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      className="text-gray-700 uppercase font-bold text-sm"
                      htmlFor="fecha-entrega">
                      Fecha de Entrega{" "}
                    </label>
                    <input
                      type="date"
                      id="fecha-entrega"
                      className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                      value={fechaDeEntrega}
                      onChange={(e) => {
                        setFechaDeEntrega(e.target.value);
                      }}
                    />
                  </div>

                  <div className="mb-5">
                    <label
                      className="text-gray-700 uppercase font-bold text-sm"
                      htmlFor="prioridad">
                      Prioridad{" "}
                    </label>
                    <select
                      id="prioridad"
                      className="border-2 w-full p-2 mt-2 placeholder-gray-400 rounded-md"
                      value={prioridad}
                      onChange={(e) => {
                        setPrioridad(e.target.value);
                      }}>
                      <option value="Baja">Baja</option>
                      <option value="Media">Media</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleCrear();
                  }}>
                  Crear
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="flex justify-between my-10 w-11/12 mx-auto lg:w-full">
        <h1 className="lg:text-4xl text-2xl font-black text-sky-700 my-auto">
          Tareas
        </h1>

        <div className="lg:ml-5 flex gap-5 justify-center items-center">
          {isDesktop && <h2 className="font-semibold text-xl">Ordenar por:</h2>}
          <select
            className="border-2 border-gray-300 rounded-md py-1 pr-3 pl-1  text-gray-700 focus:outline-none focus:border-sky-500"
            value={opcionOrden}
            onChange={(e) => setOpcionOrden(e.target.value)}>
            <option value="fecha">Fecha de Entrega</option>
            <option value="estado">Estado</option>
            <option value="prioridad">Prioridad</option>
          </select>
        </div>

        <button
          className="bg-sky-600 px-2 lg:px-6 h-12 font-semiboldbold flex text-white items-center justify-center uppercase font-bold hover:bg-sky-700 transition-colors rounded-full  lg:mr-10 "
          onClick={onOpen}>
          <svg
            viewBox="0 0 1024 1024"
            fill="currentColor"
            height={`${isDesktop ? "2rem" : "1.6rem"}`}
            width="2em">
            <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494zM544 472c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v108H372c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h108v108c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V644h108c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V472z" />
          </svg>
        </button>
      </div>

      <div className="flex min-h-32 flex-col w-full">
        {tareasOrdenadas.length !== 0 ? (
          tareasOrdenadas.map((tarea) => (
            <Tarea
              key={tarea._id}
              tarea={tarea}
              handleEliminarTarea={handleEliminarTarea}
            />
          ))
        ) : (
          <p className="font-semibold text-xl text-center my-auto">
            <button className="text-sky-600" onClick={onOpen}>
              Crea
            </button>{" "}
            tareas para tu proyecto
          </p>
        )}
      </div>
    </>
  );
};
export default Tareas;
