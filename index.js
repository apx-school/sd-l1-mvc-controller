
function main() {
  const args = process.argv.slice(2);

  const argsObject = argsController(args, {
    create: {
      mainArgRequired: false,
      requiredArgs: ["title", "price"],
      resolver: createController
    },
    get: {
      mainArgRequired: true,
      resolver: getController
    },
    update: {
      mainArgRequired: true,
      requiredArgs: ["title", "price"],
      resolver: updateController
    },
    del: {
      mainArgRequired: true,
      resolver: delController
    }
  });

  if (argsObject.error) {
    console.error(argsObject.error);
  }
}

main();

function argsController(args, commandsMap) {
  const commandName = args.length > 0 ? args[0] : null;
  if (!commandName) {
    return { error: "No command provided." };
  }
  const commandConfig = commandsMap[commandName];

  if (!commandConfig) {
    return { error: `Comando desconocido: ${commandName}` };
  }

  let mainArg = null;
  const argsObject = {};

  let i = 1;
  if (commandConfig.mainArgRequired) {
    if (!args[i] || args[i].startsWith("--")) {
      return { error: `El comando '${commandName}' requiere un argumento principal.` };
    }
    mainArg = args[i];
    i++;
  }

  while (i < args.length) {
    const current = args[i];

    if (current.startsWith("--")) {
      const key = current.substring(2);
      const next = args[i + 1];

      if (next && !next.startsWith("--")) {
        argsObject[key] = next;
        i++; // Saltamos el valor ya procesado
      } else {
        argsObject[key] = true; // Flag sin valor explícito
      }
    }

    i++;
  }

  if (commandConfig.requiredArgs) {
    const missingArgs = commandConfig.requiredArgs.filter(
      (arg) => !(arg in argsObject)
    );

    if (missingArgs.length > 0) {
      return { error: `Faltan argumentos requeridos para el comando '${commandName}': ${missingArgs.join(", ")}` };
    }
  }
  if (commandConfig.mainArgRequired) {
    commandConfig.resolver(mainArg, argsObject);
  } else {
    commandConfig.resolver(argsObject);
  }

  return { command: commandName, mainArg, args: argsObject };
}

// Controllers
function createController(args) {
  const newProp = createPropModel(args);
  showPropView(newProp);
}

function getController(mainArg) {
  const prop = getProp(mainArg);
  showPropView(prop);
}

function updateController(mainArg, args) {
  const updatedProp = updateProp(mainArg, args);
  showPropView(updatedProp);
}

function delController(mainArg) {
  deleteProp(mainArg);
  console.log("Propiedad eliminada con éxito");
}
// Models Mock
/**
 * Crea una nueva propiedad en la base de datos y la devuelve.
 */
function createPropModel(data) {
  return { id: Math.floor(Math.random() * 1000), ...data };
}

/**
 * Elimina una propiedad de la base de datos según su ID y devuelve el resultado.
 */
function deleteProp(id) {
  return { id, status: "deleted" };
}

/**
 * Actualiza una propiedad en la base de datos según su ID y devuelve la versión actualizada.
 */
function updateProp(id, data) {
  return { id, ...data, updatedAt: new Date().toISOString() };
}

/**
 * Obtiene una propiedad de la base de datos según su ID y la devuelve.
 */
function getProp(id) {
  return { id, title: "Sample Title", price: 100, createdAt: new Date().toISOString() };
}

// Views Mock
function showPropView(prop) {
  if (Array.isArray(prop)) {
    console.table(prop);
  } else {
    console.table([prop]);
  }
}

// Tests
function testArgsController() {
  const commandsMap = {
    create: {
      mainArgRequired: false,
      requiredArgs: ["title", "price"],
      resolver: () => { },
    },
    get: {
      mainArgRequired: true,
      resolver: () => { },
    },
    update: {
      mainArgRequired: true,
      resolver: () => { },
    },
    del: {
      mainArgRequired: true,
      resolver: () => { },
    },
  };

  const tests = [
    { command: ["create", "--title", "Departamento", "--price", "15000"], expectedError: false },
    { command: ["create", "--title", "Departamento"], expectedError: true },
    { command: ["get", "id-123"], expectedError: false },
    { command: ["get"], expectedError: true },
    { command: ["update", "id-123", "--precio", "300000"], expectedError: false },
    { command: ["del", "id-123"], expectedError: false },
    { command: ["del"], expectedError: true },
  ];

  tests.forEach(({ command, expectedError }, index) => {
    const result = argsController(command, commandsMap);
    const hasError = Boolean(result.error);
    console.log(`Test ${index + 1}: ${hasError === expectedError ? '✅' : '❌'} - Comando: ${command.join(" ")}`);
  });
}

// descomentá esta linea parar correr los tests
// testArgsController();
