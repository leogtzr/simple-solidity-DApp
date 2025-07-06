# SimpleSolidity DApp

Una DApp fullstack de ejemplo para interactuar con un contrato inteligente Solidity, desarrollada con Next.js, Foundry y wagmi/viem. Permite publicar un mensaje, recibir likes/dislikes y donaciones, y cuenta con un dashboard de administración para guardar un mensaje.

---

## Tabla de Contenidos

* [Estructura del Proyecto](#estructura-del-proyecto)

* [Requisitos](#requisitos)

* [Setup del Proyecto](#setup-del-proyecto)

* [Compilación y Testing de Smart Contracts](#compilacion-y-testing-de-smart-contracts)

* [Deployment del Smart Contract](#deployment-del-smart-contract)

* [Frontend: Correr la DApp](#frontend-correr-la-dapp)

* [Uso de la DApp](#uso-de-la-dapp)

* [Comandos Útiles y Misceláneo](#comandos-utiles-y-miscelaneo)

* [Licencia](#licencia)

---

## Estructura del Proyecto

```
.
├── cmds.txt
├── eslint.config.mjs
├── LICENSE
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
├── README.md
├── SimpleSolidityABI.json
├── SmartContracts/
│   ├── script/
│   │   └── SimpleSolidity.s.sol
│   ├── SimpleSolidity.sol
│   └── test/
│       └── SimpleSolidity.t.sol
├── src/
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── admin-dashboard.tsx
│   │   └── index.tsx
│   └── styles/
│       └── globals.css
└── tsconfig.json
```

---

## Requisitos

* [Node.js](https://nodejs.org/) >= 18

* [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`, `anvil`)

* [pnpm](https://pnpm.io/) o [npm](https://www.npmjs.com/)

* [MetaMask](https://metamask.io/) (para interactuar con la DApp)

---

## Setup del Proyecto

1. **Clona el repositorio y entra al directorio:**

  ```sh
  git clone <repo-url>
  cd simple-solidity-DApp
  ```

2. **Instala dependencias del frontend:**

  ```sh
  pnpm install
  # o
  npm install
  ```

3. **Instala dependencias de los smart contracts:**

  ```sh
  cd SmartContracts
  forge install OpenZeppelin/openzeppelin-contracts
  cd ..
  ```

---

## Compilación y Testing de Smart Contracts

1. **Compilar contratos:**

  ```sh
  cd SmartContracts
  forge build
  ```

2. **Correr los tests:**

  ```sh
  forge test
  ```

  Puedes correr un test específico:

  ```sh
  forge test --match-test testSetMessage
  ```

---

## Deployment del Smart Contract

### Opción 1: Deploy usando Script (recomendado)

1. **Configura tu variable de entorno con la private key:**

  * Crea un archivo `.env` en la raíz de `SmartContracts`:

    ```sh
    echo 'PRIVATE_KEY=tu_private_key' > .env
    ```

  * O exporta la variable en tu terminal:

    ```sh
    export PRIVATE_KEY=tu_private_key
    ```

2. **Inicia Anvil (red local):**

  ```sh
  anvil
  ```

3. **Haz deploy con el script:**

  ```sh
  cd SmartContracts
  forge script script/SimpleSolidity.s.sol --broadcast --rpc-url http://localhost:8545
  ```

  * La dirección del contrato aparecerá en la salida del comando.

### Opción 2: Deploy directo con `forge create`

1. **Inicia Anvil si no lo has hecho:**

  ```sh
  anvil
  ```

2. **Haz deploy directo:**

  ```sh
  cd SmartContracts
  forge create src/SimpleSolidity.sol:SimpleSolidity --unlocked --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --broadcast
  ```

  * Usa una de las cuentas que te da Anvil.

  * La dirección del contrato aparecerá en la salida.

### Obtener el ABI para el frontend

1. **Después de compilar, copia el ABI:**

  ```sh
  jq '.abi' out/SimpleSolidity.sol/SimpleSolidity.json > ../../SimpleSolidityABI.json
  ```

  * O abre el archivo en `out/SimpleSolidity.sol/SimpleSolidity.json` y copia el elemento `abi` manualmente.

---

## Frontend: Correr la DApp

1. **Regresa a la raíz del proyecto:**

  ```sh
  cd ../
  ```

2. **Configura la dirección del contrato en el frontend:**

  * Edita el archivo `src/pages/index.tsx` y `src/pages/admin-dashboard.tsx` para poner la dirección correcta del contrato.

3. **Inicia el servidor de desarrollo:**

  ```sh
  pnpm dev
  # o
  npm run dev
  ```

4. **Abre la DApp en tu navegador:**

  * [http://localhost:3000](http://localhost:3000)

---

## Uso de la DApp

* **Página principal:**

  * Muestra el mensaje actual, likes, dislikes y permite donar ETH.

  * Puedes dar like/dislike y ver los cambios en tiempo real.

* **Admin Dashboard:**

  * Solo el owner puede cambiar el mensaje del contrato.

  * Requiere estar conectado con la cuenta owner y en la red local (Anvil).

---

## Comandos Útiles y Misceláneo

* **Ver el ABI del contrato:**

  ```sh
  forge inspect SimpleSolidity abi
  ```

* **Llamar funciones del contrato desde la terminal:**

  ```sh
  cast call <direccion> "likesCount()"
  cast send <direccion> "like()" --unlocked --from <cuenta>
  ```

* **Ver logs de eventos:**

  ```sh
  cast logs --from-block latest --to-block latest --rpc-url http://localhost:8545
  ```

* **Ver el código de un contrato:**

  ```sh
  cast code <direccion>
  ```

* **Limpiar y recompilar:**

  ```sh
  forge clean && forge build
  ```

---

## Licencia

MIT
