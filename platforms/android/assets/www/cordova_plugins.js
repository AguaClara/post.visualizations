cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-google-analytics.UniversalAnalytics",
        "file": "plugins/cordova-plugin-google-analytics/www/analytics.js",
        "pluginId": "cordova-plugin-google-analytics",
        "clobbers": [
            "analytics"
        ]
    },
    {
        "id": "cordova-plugin-whitelist.whitelist",
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "id": "cordova-sqlite-storage.SQLitePlugin",
        "file": "plugins/cordova-sqlite-storage/www/SQLitePlugin.js",
        "pluginId": "cordova-sqlite-storage",
        "clobbers": [
            "SQLitePlugin"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-google-analytics": "0.8.1",
    "cordova-plugin-whitelist": "1.2.1",
    "cordova-sqlite-storage": "1.2.1"
};
// BOTTOM OF METADATA
});