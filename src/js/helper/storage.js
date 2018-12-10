var fs = require('fs');

// temporary and persistent data storage
var appStore = {

    /**
     * @desc current date in dd/mm/yyyy format
     */
    today: function () {
        return new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'numeric',
            month: 'numeric',
            day: 'numeric'
        })
    },

    /**
     * @desc get persistent storage
     * @return {*} value of the meta
     */
    getMeta: function () {
        return new Promise((resolve, reject) => {
            fs.readFile('metadata.json', 'utf-8', (er, fileData) => {
                if (!er) {
                    resolve(JSON.parse(fileData));
                } else {
                    reject(er);
                }
            })
        })
    },

    /**
     * @desc set persistent storage
     */
    setMeta: function (data) {
        return new Promise((resolve, reject) => {
            fs.writeFile('metadata.json', JSON.stringify(data), (er) => {
                if (!er) {
                    resolve();
                } else {
                    reject();
                }
            })
        })
    },

    /**
     * Query for a stored item
     */
    query: function (match, data) {
        var Data = {};
        for (var key in data) {
            if (key === match) {
                return data[key];
            }
        }
        return Data;
    },
    
    /**
     * @param {string} query matching key
     */
    read: function (query) {
        console.info("Reading storage !");
        return new Promise((resolve, reject) => {
            localStorage.getItem((data) => {
                if (query) {
                    if (query === 'meta') {
                        var data = appStore.query(query, data);
                        if (data.length) {
                            resolve(data);
                        } else {
                            settings.read()
                                .then((data) => resolve(data))
                                .catch((er) => reject(er))
                        }
                    } else {
                        resolve(appStore.query(query, data).value);
                    }
                } else {
                    resolve(data);
                }
            })
        })
    },

    /**
     * @param {*} data 
     */
    store: function (data) {
        var key = Object.keys(data)[0];
        data = typeof data === 'object' ? data[key] : data;
        var obj = JSON.parse(`
            {
                "${key}": {
                "added": "${this.today()}",
                "lastModefied": "${this.today()}",
                "value": ""
                }
            }
        `);
        obj.value = data;
        localStorage.setItem(JSON.stringify(obj));
    },

    /**
     * @param {string} key
     * @param {*} value
     */
    update: function (key, value) {
        if (typeof key === 'object') {
            chrome.local.storage.setItem(key);
        } else {
            localStorage.getItem((data) => {
                data.lastModefied = today();
                data[key] =  value;
            })
        }
    },

    /**
     * Clear all the data
     */
    clearAll: function () {
        var data = this.read();
        for (var key in data) {
            localStorage.remove(key);
        }
    },

    /**
     * @param {string} key 
     */
    clear: function (key) {
        if (key) {
            localStorage.remove(key);
        }
    },

    /**
     * @return Current storage size in bytes
     */
    size: function () {
        localStorage.getItemBytesInUse(function (bytes) {
            return bytes;
        })
    }
};
