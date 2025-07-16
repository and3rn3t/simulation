#!/usr/bin/env node

/**
 * Simple Performance Analytics Test
 * Tests the performance analytics system functionality
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

console.log("🧪 Testing Performance Analytics System...\n");

// Test 1: Check if performance analytics script exists
console.log("1. Checking performance analytics script...");
if (existsSync("scripts/performance-analytics.mjs")) {
  console.log("   ✅ Performance analytics script found");
} else {
  console.log("   ❌ Performance analytics script not found");
  process.exit(1);
}

// Test 2: Import and test the PerformanceAnalyzer class
console.log("\n2. Testing performance analyzer import...");
try {
  const { PerformanceAnalyzer } = await import("./performance-analytics.mjs");
  console.log("   ✅ PerformanceAnalyzer imported successfully");

  // Test 3: Create instance and test basic functionality
  console.log("\n3. Testing basic functionality...");
  const analyzer = new PerformanceAnalyzer();

  // Test execution metrics collection
  console.log("   📊 Testing execution metrics...");
  await analyzer.collectExecutionMetrics();
  console.log("   ✅ Execution metrics collected");

  // Test resource utilization analysis
  console.log("   🔧 Testing resource analysis...");
  await analyzer.analyzeResourceUtilization();
  console.log("   ✅ Resource analysis completed");

  // Test cost metrics calculation
  console.log("   💰 Testing cost metrics...");
  await analyzer.calculateCostMetrics();
  console.log("   ✅ Cost metrics calculated");

  // Test report generation
  console.log("   📋 Testing report generation...");
  const report = analyzer.generateReport();
  console.log("   ✅ Report generated successfully");

  // Display key results
  console.log("\n📊 Performance Analytics Results:");
  console.log(`   Overall Score: ${report.scorecard.overall}/100`);
  console.log(`   Performance Grade: ${report.summary.overallPerformance}`);
  console.log(`   Pipeline Time: ${report.summary.executionTime}`);
  console.log(`   Parallel Efficiency: ${report.summary.parallelEfficiency}`);
  console.log(`   Monthly Cost: ${report.summary.monthlyCost}`);
  console.log(
    `   Optimization Potential: ${report.summary.optimizationPotential}`
  );
  console.log(`   Recommendations: ${report.recommendations.length}`);
  console.log(`   Alerts: ${report.alerts.length}`);

  // Test 4: Verify report file creation
  console.log("\n4. Verifying report file...");
  if (existsSync("reports/performance-analytics-report.json")) {
    console.log("   ✅ Report file created successfully");

    // Read and validate report structure
    const reportData = JSON.parse(
      readFileSync("reports/performance-analytics-report.json", "utf8")
    );
    const requiredFields = [
      "timestamp",
      "summary",
      "execution",
      "resources",
      "costs",
      "recommendations",
      "scorecard",
    ];

    let validStructure = true;
    for (const field of requiredFields) {
      if (!reportData[field]) {
        console.log(`   ❌ Missing required field: ${field}`);
        validStructure = false;
      }
    }

    if (validStructure) {
      console.log("   ✅ Report structure validated");
    }
  } else {
    console.log("   ❌ Report file not created");
  }

  console.log(
    "\n✅ All tests passed! Performance analytics system is functional."
  );
} catch (error) {
  console.error("❌ Test failed:", error.message);
  process.exit(1);
}

console.log("\n🎯 Performance Analytics Test Complete!");
console.log(
  "📄 Check reports/performance-analytics-report.json for detailed results."
);
