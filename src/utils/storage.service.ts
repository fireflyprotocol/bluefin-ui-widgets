const setItemInStorage = (key: string, value: string) => {
	localStorage.setItem(key, value);
};
const getItemByKey = (key: string) => {
	return localStorage.getItem(key);
};

const StorageService = {
	setItemInStorage,
	getItemByKey,
};

export default StorageService;
