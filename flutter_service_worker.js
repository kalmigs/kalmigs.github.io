'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/FontManifest.json": "d7d81bb791c0d7586a63ba63c6923453",
"assets/assets/fonts/Camar.otf": "409bd976fb8e1bfb2565f744f504a922",
"assets/assets/fonts/Potra.otf": "96a107667b372804fc29bc612f538627",
"assets/assets/fonts/Moon2.0-Regular.otf": "beaab26664137dc78edd6a735b31b40d",
"assets/assets/fonts/OpenSans-ExtraBold.ttf": "fb7e3a294cb07a54605a8bb27f0cd528",
"assets/assets/fonts/Moon2.0-Bold.otf": "e1c9d28f01f0370f8ec7b1fd16009f21",
"assets/assets/fonts/OpenSans-Regular.ttf": "3ed9575dcc488c3e3a5bd66620bdf5a4",
"assets/assets/fonts/Moon2.0-Light.otf": "14e8e211ca6c8cd2bc46f566ab2a3c67",
"assets/assets/images/portfolio04.png": "e06d2bd842cd40e33113b3556b45b070",
"assets/assets/images/starter01.png": "6be1ea1522a9e53c6bc3efdab838a812",
"assets/assets/images/portfolio03.png": "2215f877bb56d848cf7a7eae84266a0a",
"assets/assets/images/pektogo03.png": "3166f5cd76ac71beb528b5eb59402715",
"assets/assets/images/dboard01.png": "010a4a85db73f4d917034ef1fcf85e76",
"assets/assets/images/pektogo04.png": "5d6312c0c475412d673de87dd5b0e8a8",
"assets/assets/images/pektogo05.png": "7d67f232eddb82d7f64bd7e8fdaa364c",
"assets/assets/images/pektogo02.png": "98887479d26652ada646442e751feb68",
"assets/assets/images/dboard03.png": "a6898579ab3a8474af2366104a39fb69",
"assets/assets/images/portfolio02.png": "f2c86d3ffd1c069b68332c9c68bd4edb",
"assets/assets/images/pektogo01.png": "0878581ff9abc08953fd59876e2b3b24",
"assets/assets/images/dboard02.png": "bb4bacdc1c2a5bf2549ee902ec4745c4",
"assets/assets/images/portfolio01.png": "a0321652b115db57baf7cffeff5333fa",
"assets/AssetManifest.json": "f608d2f00852b3d9995630d27b3f11c6",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/NOTICES": "00b294964dfc3bee6e7fc3369b21acd7",
"main.dart.js": "da2e058f1c7a942561fffd9077617c88",
"manifest.json": "a83bbbd9d23ea4d752fbcd44cdc544fa",
"version.json": "5f79c14b43951d85b5527583e469202a",
"index.html": "8c4a6c7108768c8bda7d8dfc59dc0a03",
"/": "8c4a6c7108768c8bda7d8dfc59dc0a03",
"favicon.png": "816f9844852220fb32d34aaca19df7d7",
"icons/Icon-192.png": "269e0c612e30140456bc7b4dff4d683a",
"icons/Icon-512.png": "4ea278604085a844eb045735b10ca2c8"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
