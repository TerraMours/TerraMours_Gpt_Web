import Dexie, {DexieOptions, Table} from 'dexie';

export interface ChatEntity {

}

export class MySubClassedDexie extends Dexie {
	chatEntities!: Table<ChatEntity>;

	constructor(options: DexieOptions) {
		super('terr-amours', options);
		this.version(1).stores({
			chatEntities: '++id, name, age' // Primary key and indexed props
		});
	}
}

export const dataBase = new MySubClassedDexie({});
