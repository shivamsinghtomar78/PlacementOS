export const HEAT_TRANSFER_SYLLABUS = [
  {
    name: "1.1 Heat Transfer Definition and Modes",
    difficulty: "Beginner",
    subtopics: [
      "Heat transfer as thermal energy transfer due to temperature difference",
      "Second law direction: from hot body to cold body",
      "Conduction through matter by molecular interaction",
      "Convection through fluid motion",
      "Radiation through electromagnetic waves without medium",
      "Combined-mode heat transfer in real systems"
    ]
  },
  {
    name: "1.2 Engineering Applications and Design Objectives",
    difficulty: "Beginner",
    subtopics: [
      "Power plants, refrigeration and air conditioning, electronics cooling",
      "Building insulation and thermal protection systems",
      "Industrial process heating and thermal management",
      "Rate maximization/minimization in design",
      "Temperature control, material selection, and efficiency-cost tradeoff"
    ]
  },
  {
    name: "1.3 Fourier, Newton, and Stefan-Boltzmann Laws",
    difficulty: "Beginner",
    subtopics: [
      "Fourier law: q = -k dT/dx and meaning of negative sign",
      "Thermal conductivity k and its units, dependence on material and temperature",
      "Newton law of cooling: Q = hA(Ts - Tf)",
      "Convection coefficient h and influencing parameters",
      "Stefan-Boltzmann law: Q = epsilon sigma A(Ts^4 - Tsurr^4)",
      "Radiative properties: emissivity, absorptivity, reflectivity, transmissivity",
      "Kirchhoff law for opaque surfaces in thermal equilibrium"
    ]
  },
  {
    name: "2.1 1D Steady Conduction in Plane Wall",
    difficulty: "Beginner",
    subtopics: [
      "Steady no-generation equation: d2T/dx2 = 0",
      "Linear temperature profile and boundary conditions",
      "Thermal resistance concept R = L/(kA)",
      "Series resistance network and electrical analogy",
      "Composite wall heat flow and interface temperatures",
      "Overall heat transfer coefficient U for multilayer systems"
    ]
  },
  {
    name: "2.1 Thermal Contact Resistance and Convection Boundary",
    difficulty: "Intermediate",
    subtopics: [
      "Contact resistance due to roughness and air gaps",
      "Effect of pressure and thermal interface materials",
      "Convection resistance Rconv = 1/(hA)",
      "Combined conduction-convection resistance network",
      "Surface temperature estimation from resistance division"
    ]
  },
  {
    name: "2.1 Radial Conduction in Cylinders and Spheres",
    difficulty: "Intermediate",
    subtopics: [
      "Cylinder equation and logarithmic temperature profile",
      "Cylindrical resistance: R = ln(ro/ri)/(2*pi*k*L)",
      "Spherical equation and inverse-radius profile",
      "Spherical resistance: R = (ro-ri)/(4*pi*k*ri*ro)",
      "Applications to pipes, insulation, and pressure vessels"
    ]
  },
  {
    name: "2.1 Extended Surfaces (Fins)",
    difficulty: "Intermediate",
    subtopics: [
      "Need for fins and enhanced convective area",
      "Fin temperature distribution and boundary conditions",
      "Fin efficiency and fin effectiveness",
      "Overall surface efficiency with fin arrays"
    ]
  },
  {
    name: "2.2 Internal Heat Generation",
    difficulty: "Intermediate",
    subtopics: [
      "Conduction with generation: d2T/dx2 = -qdot_gen/k",
      "Parabolic temperature profile and Tmax location",
      "Slab/cylinder generation problems with symmetry",
      "Applications: electric heaters, fuel rods, friction heating"
    ]
  },
  {
    name: "2.2 Transient Conduction and Lumped Analysis",
    difficulty: "Advanced",
    subtopics: [
      "Biot number and criterion for lumped method",
      "Characteristic length Lc = V/A",
      "Transient solution: T(t) = Tinf + (Ti-Tinf)exp(-t/tau)",
      "Time constant tau = rho*V*cp/(hA)",
      "When spatial gradients require non-lumped treatment"
    ]
  },
  {
    name: "2.2 Numerical Transient Conduction Basics",
    difficulty: "Advanced",
    subtopics: [
      "Finite difference spatial discretization",
      "Explicit and implicit time marching",
      "Stability criterion based on Fourier number",
      "Use of computational tools for transient fields"
    ]
  },
  {
    name: "3.1 Natural Convection Fundamentals",
    difficulty: "Intermediate",
    subtopics: [
      "Buoyancy-driven flow from density variation",
      "Grashof number and physical interpretation",
      "Rayleigh number Ra = Gr*Pr and transition behavior",
      "Typical laminar-turbulent criterion for natural convection"
    ]
  },
  {
    name: "3.1 Natural Convection Correlations",
    difficulty: "Intermediate",
    subtopics: [
      "Vertical plate laminar and turbulent Nusselt correlations",
      "Horizontal surface orientation effects",
      "Natural convection in enclosed cavities",
      "Applicability ranges and characteristic length choices"
    ]
  },
  {
    name: "3.2 External Forced Convection and Boundary Layers",
    difficulty: "Intermediate",
    subtopics: [
      "Flat plate, cylinder, and sphere external flow",
      "Hydrodynamic and thermal boundary layer development",
      "Reynolds number transition criteria",
      "Nusselt and Prandtl number interpretation"
    ]
  },
  {
    name: "3.2 Forced Convection Correlations",
    difficulty: "Intermediate",
    subtopics: [
      "Flat plate local and average laminar correlations",
      "Dittus-Boelter type turbulent relation",
      "Cylinder and sphere crossflow empirical forms",
      "Constant wall temperature versus constant heat flux cases"
    ]
  },
  {
    name: "3.3 Internal Laminar Duct Flow",
    difficulty: "Intermediate",
    subtopics: [
      "Hydrodynamically and thermally fully developed flow",
      "Laminar friction factor f = 64/Re",
      "Thermal entrance region and developing Nusselt number",
      "Canonical fully developed values for tube wall conditions"
    ]
  },
  {
    name: "3.3 Internal Turbulent Duct Flow",
    difficulty: "Intermediate",
    subtopics: [
      "Blasius and Moody/Colebrook friction estimation",
      "Dittus-Boelter and Gnielinski correlations",
      "Bulk mean temperature and wall temperature tracking",
      "Non-circular ducts and hydraulic diameter"
    ]
  },
  {
    name: "4.1 Heat Exchanger Types and Flow Arrangements",
    difficulty: "Intermediate",
    subtopics: [
      "Recuperators and regenerators",
      "Parallel, counter, and cross-flow configurations",
      "Shell-and-tube, plate, and finned exchangers",
      "Arrangement impact on effectiveness"
    ]
  },
  {
    name: "4.2 LMTD Method",
    difficulty: "Intermediate",
    subtopics: [
      "Q = U*A*DeltaTlm and correction factor usage",
      "LMTD definition and inlet-outlet terminal differences",
      "Overall U from hot-side, wall, fouling, and cold-side resistances",
      "Design checks for area and outlet temperatures"
    ]
  },
  {
    name: "4.2 Effectiveness-NTU Method",
    difficulty: "Advanced",
    subtopics: [
      "NTU = UA/Cmin and capacity-rate ratio Cr",
      "Effectiveness as function of NTU, Cr, and arrangement",
      "Sizing when outlet temperatures are unknown",
      "Comparative design and off-design analysis"
    ]
  },
  {
    name: "4.3 Fouling and Pressure Drop in Heat Exchangers",
    difficulty: "Advanced",
    subtopics: [
      "Fouling mechanisms and fouling resistance",
      "Allowances in practical design",
      "Pressure drop constraints versus heat transfer enhancement",
      "Pump/fan power and lifecycle performance tradeoffs"
    ]
  },
  {
    name: "5.1 Blackbody and Spectral Radiation",
    difficulty: "Intermediate",
    subtopics: [
      "Planck distribution and spectral intensity concept",
      "Wien displacement law and peak wavelength shift",
      "Stefan-Boltzmann total emissive power",
      "Role of temperature in spectral and total emission"
    ]
  },
  {
    name: "5.1 Surface Radiation Properties",
    difficulty: "Intermediate",
    subtopics: [
      "Emissivity, absorptivity, reflectivity, transmissivity",
      "Opaque-surface relation alpha + rho = 1",
      "Spectral and directional effects",
      "Kirchhoff relation in equilibrium"
    ]
  },
  {
    name: "5.2 View Factor and Enclosure Radiation",
    difficulty: "Advanced",
    subtopics: [
      "Definition and geometric nature of view factor",
      "Reciprocity and summation rules",
      "Standard geometry evaluation methods",
      "Two-surface and multi-surface enclosure analysis"
    ]
  },
  {
    name: "5.3 Combined Radiation-Convection-Conduction",
    difficulty: "Advanced",
    subtopics: [
      "Surface energy balance with multiple modes",
      "Linearized radiation coefficient approach",
      "Coupled iterative solution strategies",
      "Applications in furnaces, solar absorbers, and electronics"
    ]
  },
  {
    name: "6.1 Boiling Regimes and Critical Heat Flux",
    difficulty: "Advanced",
    subtopics: [
      "Nucleate boiling mechanism and high heat transfer coefficient",
      "Pool boiling curve interpretation",
      "Critical heat flux and burnout significance",
      "Transition and film boiling including Leidenfrost behavior"
    ]
  },
  {
    name: "6.1 Boiling Correlations",
    difficulty: "Advanced",
    subtopics: [
      "Rohsenow-type nucleate boiling prediction",
      "Saturated versus subcooled boiling trends",
      "Film boiling estimation concepts",
      "Safety relevance in high-heat-flux equipment"
    ]
  },
  {
    name: "6.2 Condensation Heat Transfer",
    difficulty: "Advanced",
    subtopics: [
      "Film condensation and liquid-film resistance",
      "Nusselt laminar film condensation model",
      "Dropwise condensation and enhancement potential",
      "Vertical and horizontal surface/tube cases"
    ]
  },
  {
    name: "7. Mass Transfer Analogy",
    difficulty: "Advanced",
    subtopics: [
      "Fick law of diffusion and analogy to Fourier law",
      "Convective mass transfer coefficient concept",
      "Heat-mass transfer analogies and Lewis number",
      "Basic coupling of thermal and concentration boundary layers"
    ]
  },
  {
    name: "8. Numerical Methods in Heat Transfer",
    difficulty: "Advanced",
    subtopics: [
      "Finite difference formulation for steady conduction",
      "Explicit, implicit, and Crank-Nicolson transient schemes",
      "Linear solver approaches: Gauss elimination and iterative methods",
      "Finite element method basics for complex geometries"
    ]
  },
  {
    name: "9. Exam-Focused Topic Prioritization",
    difficulty: "Advanced",
    subtopics: [
      "ESE emphasis: full-spectrum depth and design-level problems",
      "GATE emphasis: core formulas, quick numerical application",
      "ISRO/BARC/DRDO emphasis: advanced thermal analysis",
      "State AE/SSC JE emphasis: standard fundamental problem solving"
    ]
  },
  {
    name: "9.2 Standard Problem-Solving Patterns",
    difficulty: "Advanced",
    subtopics: [
      "Composite wall workflow: resistances to interface temperatures",
      "Convection workflow: dimensionless numbers to correlation and h",
      "Heat exchanger workflow: LMTD/NTU to duty and consistency checks",
      "Radiation workflow: view factors, enclosure equations, net exchange",
      "Transient workflow: Biot check then lumped/charts/numerical route"
    ]
  },
  {
    name: "10. Study Plan and Practice Roadmap",
    difficulty: "Beginner",
    subtopics: [
      "20-week progression: fundamentals to advanced topics",
      "Topic-wise revision and weak-area closure",
      "Mock-test strategy and time management",
      "Target practice volume: 350+ quality problems",
      "Formula retention and exam-day execution checklist"
    ]
  }
];
