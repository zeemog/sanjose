/**
 * San José · Taller de Enmarcaciones
 * Datos del catálogo de modelos — archivo de configuración centralizado.
 * Modificar este archivo para agregar, editar o eliminar modelos.
 */

const CATALOGO = [
  {
    id: "kiri-natural",
    nombre: "Kiri Natural",
    moldura: "Madera de kiri",
    acabado: "Natural barnizado mate",
    paspartu: ["Blanco", "Crema"],
    medidas: ["18×24", "24×30", "30×40", "40×50", "50×70"],
    descripcion: "Perfil fino de madera de kiri de tono cálido natural. Ideal para láminas botánicas, acuarelas e ilustraciones.",
    imagen: "img/catalog-kiri.jpg",
    precioOrientativo: null,
  },
  {
    id: "pino-negro",
    nombre: "Pino Negro",
    moldura: "Pino pintado",
    acabado: "Negro mate",
    paspartu: ["Blanco", "Crema"],
    medidas: ["13×18", "18×24", "24×30", "30×40", "40×50"],
    descripcion: "Perfil slim en pino pintado negro mate. Elegante y atemporal, perfecto para retratos y fotografías en blanco y negro.",
    imagen: "img/catalog-black.jpg",
    precioOrientativo: null,
  },
  {
    id: "pino-blanco",
    nombre: "Pino Blanco",
    moldura: "Pino pintado",
    acabado: "Blanco roto",
    paspartu: ["Blanco", "Crema", "Ninguno"],
    medidas: ["18×24", "24×30", "30×40", "40×50", "50×60"],
    descripcion: "Marco en pino con terminación blanco roto. Luminoso y versátil, combina con cualquier espacio y tipo de obra.",
    imagen: "img/catalog-white.jpg",
    precioOrientativo: null,
  },
  {
    id: "galeria-roble",
    nombre: "Galería Roble",
    moldura: "Madera de roble",
    acabado: "Miel natural",
    paspartu: ["Blanco ancho", "Crema ancho"],
    medidas: ["24×30", "30×40", "40×50", "50×70", "70×100"],
    descripcion: "Perfil amplio en roble miel, paspartú extra ancho al estilo galería. Para obras que merecen presencia.",
    imagen: "img/catalog-gallery.jpg",
    precioOrientativo: null,
  },
];

const OPCIONES_CONFIGURADOR = {
  molduras: [
    { id: "kiri-natural", label: "Kiri natural", color: "#D8C4A8" },
    { id: "pino-negro", label: "Pino negro mate", color: "#2A2A2A" },
    { id: "pino-blanco", label: "Pino blanco roto", color: "#F0EDE6" },
    { id: "roble-miel", label: "Roble miel", color: "#C4913A" },
  ],
  paspartu: {
    colores: [
      { id: "blanco", label: "Blanco", hex: "#FFFFFF" },
      { id: "crema", label: "Crema", hex: "#F5F0E8" },
      { id: "gris", label: "Gris piedra", hex: "#D8D5CC" },
    ],
    anchos: [
      { id: "angosto", label: "Angosto (3 cm)", valor: 3 },
      { id: "medio", label: "Medio (5 cm)", valor: 5 },
      { id: "ancho", label: "Ancho (8 cm)", valor: 8 },
    ],
  },
  medidas: [
    { id: "13x18", label: "13 × 18 cm", w: 13, h: 18 },
    { id: "18x24", label: "18 × 24 cm", w: 18, h: 24 },
    { id: "24x30", label: "24 × 30 cm", w: 24, h: 30 },
    { id: "30x40", label: "30 × 40 cm", w: 30, h: 40 },
    { id: "40x50", label: "40 × 50 cm", w: 40, h: 50 },
    { id: "50x70", label: "50 × 70 cm", w: 50, h: 70 },
  ],
};
