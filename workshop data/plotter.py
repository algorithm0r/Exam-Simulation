import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# Read the CSV file
file_path = './diversePopulation.csv'
data = pd.read_csv(file_path)

# Eliminate rows with all zeros
data = data[(data.T != 0).any()]

# Number of bins and subpopulations
num_bins = data.shape[1]
num_traits = data.shape[0]

# X-axis for bins
x = np.arange(num_bins)

# Plot stacked histograms
fig, ax = plt.subplots(figsize=(3.25, 2))

bottom = np.zeros(num_bins)
colors = ["#FF0000", "#00FF00", "#0000FF", "#FFA500", "#FF00FF", "#00FFFF", "#000000"]

for i in range(num_traits):
    ax.bar(x, data.iloc[i, :], bottom=bottom, color=colors[i % len(colors)], label=f'{i} Traits')
    bottom += data.iloc[i, :]

ax.set_xlabel('Questions Correct')
ax.set_ylabel('Number of Students')

desired_ticks = np.arange(0, 600, 100)
ax.set_yticks(desired_ticks)
ax.set_yticklabels(desired_ticks)
# ax.set_title('Histograms of Student Exam Data')
# ax.legend()
ax.legend(fontsize='x-small', loc='upper left', frameon=False)

plt.tight_layout()  # Adjust layout to make room for the labels
plt.show()
