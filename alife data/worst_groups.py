"""
worst_groups.py — Overlapping distribution plot for the non-linear worst-case groups.

Shows that 001110 (3 bad traits) and 011110 (4 bad traits) score lower than
111111 (6 bad traits), demonstrating that the worst outcome is not the obvious
linear accumulation of disadvantage.

Usage:
    python worst_groups.py
    python worst_groups.py --output worst_groups.pdf
    python worst_groups.py --reference  (include 000000 as faint baseline)
"""

import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

plt.rcParams["font.family"] = "Times New Roman"
plt.rcParams["font.size"]   = 10

DATA_PATH = "./examdata.csv"

# Three groups to compare + optional reference
GROUPS = ["001110", "011110", "111111"]
LABELS = [
    "001110",
    "011110",
    "111111",
]
COLORS = ["#3A6FD8", "#D4C400", "#C0392B"]   # blue, yellow, red
ALPHA  = 0.50

REFERENCE       = "000000"
REFERENCE_COLOR = "#aaaaaa"
REFERENCE_ALPHA = 0.30


def load_data(path):
    df = pd.read_csv(path, header=None)
    df[0] = df[0].astype(str).str.zfill(6)
    df = df.set_index(0)
    df.columns = list(range(101))
    return df


def build_plot(df, include_reference, output):
    fig, ax = plt.subplots(1, 1, figsize=(3.1, 2.4))
    fig.subplots_adjust(left=0.14, right=0.97, top=0.93, bottom=0.15)

    x = np.arange(101)

    ylim = max(df.loc[g].values.max() for g in GROUPS)
    if include_reference:
        ylim = max(ylim, df.loc[REFERENCE].values.max())

    if include_reference:
        ax.bar(x, df.loc[REFERENCE].values.astype(float),
               width=1.0, color=REFERENCE_COLOR, alpha=REFERENCE_ALPHA,
               linewidth=0, label="000000 — 0 disadvantaged")

    for group, label, color in zip(GROUPS, LABELS, COLORS):
        ax.bar(x, df.loc[group].values.astype(float),
               width=1.0, color=color, alpha=ALPHA, linewidth=0, label=label)

    ax.set_xlim(0, 100)
    ax.set_ylim(0, ylim * 1.05)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.set_xticks([0, 25, 50, 75, 100])
    ax.set_xlabel("Score", fontsize=10)
    ax.set_ylabel("Students", fontsize=10)

    ax.legend(fontsize=10, loc='upper right', framealpha=0.8, edgecolor='#cccccc')

    pdf_path = output if output.lower().endswith('.pdf') else output + '.pdf'
    png_path = pdf_path[:-4] + '.png'
    plt.savefig(pdf_path, dpi=300, bbox_inches='tight')
    print(f"Saved -> {pdf_path}")
    plt.savefig(png_path, dpi=150, bbox_inches='tight')
    print(f"Saved -> {png_path}")
    plt.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output',    default='worst_groups.pdf')
    parser.add_argument('--reference', action='store_true',
                        help='Include 000000 as a faint baseline')
    parser.add_argument('--data',      default=DATA_PATH)
    args = parser.parse_args()

    df = load_data(args.data)
    build_plot(df, args.reference, args.output)


if __name__ == "__main__":
    main()
