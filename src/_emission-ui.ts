import { DeepClient } from "@deep-foundation/deeplinks/imports/client";
import { TypesStore } from "./typesStore";
import debug from "debug";
import * as fs from "fs";
import * as path from 'path';
const log = debug("emission-ui");
const __dirname = path.resolve();

export const createEmissionUi = async ({deep, Types, packageName, packageId}: {
  deep: DeepClient,
  packageName: string,
  Types: TypesStore,
  packageId: number,
}) => {
  const {
    ContainId,
    HandleClientId,
    HandlerId,
    TsxId,
    clientSupportsJsId
  } = Types;
  console.log('createEmissionUi')
  console.log({packageName, ContainId, HandleClientId, HandlerId, TsxId, clientSupportsJsId});
  
  // tsxId
  // const reservedIds = await deep.reserve(1);
  const { data: [{ id: tsxId }] } = await deep.insert({
    // id: reservedIds.pop(),
    type_id: TsxId,
    string: {
      data: {
        value: fs.readFileSync(path.join(__dirname, 'src', 'emission-ui.tsx'), { encoding: 'utf-8' })
      },
    },
    in: {
      data: {
        type_id: ContainId,
        from_id: packageId,
        string: { data: { value: "emissionTsx" } },
      }
    }
  });
  log({tsxId});
  console.log({clientSupportsJsId});
  console.log({HandleClientId});
  console.log({HandlerId});
  const EmissionId = await deep.id('@suenot/emission', 'Emission');
  console.log({EmissionId});

  // handler
  const { data: [{ id: handlerId }] } = await deep.insert({
    type_id: HandlerId,
    in: {
      data: {
        type_id: ContainId,
        from_id: packageId,
        string: { data: { value: "emissionHandler" } },
      }
    },
    from_id: clientSupportsJsId,
    to_id: tsxId,
  });
  log({handlerId});

  // handleClient
  const { data: [{ id: handleClientId }] } = await deep.insert({
    type_id: HandleClientId,
    in: {
      data: {
        type_id: ContainId,
        from_id: packageId,
        string: { data: { value: "emissionHandleClient" } },
      }
    },
    from_id: EmissionId,
    to_id: handlerId,
  });
  log({handleClientId});

  return {packageId, EmissionId, tsxId, handlerId, handleClientId};
};