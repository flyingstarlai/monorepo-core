const {
  MobileAppGoogleServicesService,
} = require('./dist/app-builder/services/app-google-services.service');

// Test the parseAppIds method directly
async function testParseAppIds() {
  // Create a mock service instance (we only need the parseAppIds method)
  const service = new MobileAppGoogleServicesService(null, null);

  // Test with your google-services.json content
  const testContent = {
    client: [
      {
        client_info: {
          mobilesdk_app_id: '1:920820410613:android:cb3b0934c6fd1878d63dbc',
          android_client_info: {
            package_name: 'com.starlai.tcsmart',
          },
        },
      },
      {
        client_info: {
          mobilesdk_app_id: '1:920820410613:android:c436f1d7938fd9acd63dbc',
          android_client_info: {
            package_name: 'com.twsbp.TCS01',
          },
        },
      },
      {
        client_info: {
          mobilesdk_app_id: '1:920820410613:android:3214b89513b93984d63dbc',
          android_client_info: {
            package_name: 'com.twsbp.TCS02',
          },
        },
      },
    ],
  };

  try {
    const result = await service.parseAppIds(JSON.stringify(testContent));
    console.log('Extracted packages:', result);
    console.log('Count:', result.length);

    // Verify only TCS packages are extracted
    const expectedPackages = ['com.twsbp.TCS01', 'com.twsbp.TCS02'];
    const actualPackages = result.map((r) => r.packageName);

    console.log('Expected packages:', expectedPackages);
    console.log('Actual packages:', actualPackages);

    const isCorrect =
      expectedPackages.length === actualPackages.length &&
      expectedPackages.every((pkg) => actualPackages.includes(pkg));

    console.log('Test result:', isCorrect ? 'PASS' : 'FAIL');
  } catch (error) {
    console.error('Error:', error);
  }
}

testParseAppIds();
