"""
plot_stacked.py — Stacked histogram by bad trait count

Usage:
    python plot_stacked.py
    python plot_stacked.py --output mystacked.pdf
    python plot_stacked.py --data /path/to/data.csv
"""

import argparse
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# ─── Style ───────────────────────────────────────────────────────────────────
plt.rcParams["font.family"] = "Times New Roman"
plt.rcParams["font.size"]   = 10

DATA_PATH = "./examdata.csv"

# Autumn palette (0 bad traits = green, 6 = dark red)
BAD_COUNT_COLORS = [
    "#00AA00",  # 0 — green
    "#88CC00",  # 1 — yellow-green
    "#CCCC00",  # 2 — yellow
    "#FF8800",  # 3 — orange
    "#FF4400",  # 4 — deep orange
    "#CC1100",  # 5 — red
    "#880000",  # 6 — dark red
]

# ─── Load data ───────────────────────────────────────────────────────────────
def load_data(path):
    df = pd.read_csv(path, header=None)
    df[0] = df[0].astype(str).str.zfill(6)
    df = df.set_index(0)
    df.columns = list(range(101))
    return df

def bad_count(label):
    return label.count('1')

# ─── Build stacked arrays ────────────────────────────────────────────────────
def build_layers(df):
    layers = [np.zeros(101) for _ in range(7)]
    for label in df.index:
        bc = bad_count(label)
        layers[bc] += df.loc[label].values.astype(float)
    return layers

# ─── Plot ────────────────────────────────────────────────────────────────────
def build_stacked(df, output):
    layers = build_layers(df)
    x      = np.arange(101)

    # Right-panel layout: pairs by symmetric group size, 3 bad traits centered bottom
    #   Row 0: (0 bad, 6 bad)  — 1 group each
    #   Row 1: (1 bad, 5 bad)  — 6 groups each
    #   Row 2: (2 bad, 4 bad)  — 15 groups each
    #   Row 3: (3 bad, centered over both columns) — 20 groups
    pairs = [(0, 6), (1, 5), (2, 4)]

    fig = plt.figure(figsize=(7.0, 4.8))
    outer = fig.add_gridspec(1, 2, width_ratios=[5, 3], wspace=0.16,
                             left=0.09, right=0.99, top=0.97, bottom=0.11)

    ax_main  = fig.add_subplot(outer[0])
    right_gs = outer[1].subgridspec(4, 2, hspace=0.65, wspace=0.08)

    # ── Main stacked plot ─────────────────────────────────────────────────────
    bottom = np.zeros(101)
    for bc, layer in enumerate(layers):
        ax_main.bar(x, layer, bottom=bottom,
                    color=BAD_COUNT_COLORS[bc],
                    width=1.0, linewidth=0)
        bottom += layer

    ax_main.set_xlim(-0.5, 100.5)
    ax_main.set_ylim(0, bottom.max() * 1.05)
    ax_main.spines['top'].set_visible(False)
    ax_main.spines['right'].set_visible(False)
    ax_main.set_xticks([0, 25, 50, 75, 100])
    ax_main.tick_params(axis='both', labelsize=10)
    ax_main.set_xlabel("Score", fontsize=10)
    ax_main.set_ylabel("Number of Students", fontsize=10)

    # ── Legend inside main plot, upper right ──────────────────────────────────
    patches = [
        mpatches.Patch(color=BAD_COUNT_COLORS[bc],
                       label=f"{bc} disadvantaged")
        for bc in range(7)
    ]
    ax_main.legend(handles=patches, fontsize=10, loc='upper left',
                   framealpha=0.8, edgecolor='#cccccc', handlelength=1.2)

    # ── Helper: round up to nearest 500 ──────────────────────────────────────
    def ceil500(v):
        return int(np.ceil(v / 500) * 500)

    # ── Helper: style a small subplot ────────────────────────────────────────
    def style_small(ax, ylim, show_x=False, left_col=True):
        ax.set_xlim(-0.5, 100.5)
        ax.set_ylim(0, ylim)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.set_xticks([0, 25, 50, 75, 100])
        if show_x:
            ax.tick_params(axis='x', labelsize=10)
        else:
            ax.set_xticklabels([])
        ax.set_yticks([])
        if left_col:
            ax.text(-0.04, 1.0, f"{ylim:,}",
                    transform=ax.transAxes, ha='right', va='top',
                    fontsize=10, clip_on=False)

    # ── Paired individual plots (rows 0–2) ────────────────────────────────────
    for row, (a, b) in enumerate(pairs):
        row_ylim = ceil500(max(layers[a].max(), layers[b].max()))
        for col, bc in enumerate([a, b]):
            ax = fig.add_subplot(right_gs[row, col])
            ax.bar(x, layers[bc], width=1.0,
                   color=BAD_COUNT_COLORS[bc], linewidth=0)
            style_small(ax, row_ylim, show_x=False, left_col=(col == 0))

    # ── 3 bad traits — centered over both columns ─────────────────────────────
    # Use a spanning reference to get the bounding box, then place a half-width
    # axes centered within it.
    _ref = fig.add_subplot(right_gs[3, :])
    pos  = _ref.get_position()
    _ref.remove()
    ax3 = fig.add_axes([pos.x0 + pos.width / 4, pos.y0,
                        pos.width / 2,           pos.height])
    ax3.bar(x, layers[3], width=1.0, color=BAD_COUNT_COLORS[3], linewidth=0)
    style_small(ax3, ceil500(layers[3].max()), show_x=True, left_col=True)
    ax3.set_xlabel("Score", fontsize=10)

    # ── Save PDF and PNG ─────────────────────────────────────────────────────
    pdf_path = output if output.lower().endswith('.pdf') else output + '.pdf'
    png_path = pdf_path[:-4] + '.png'

    plt.savefig(pdf_path, dpi=300, bbox_inches='tight')
    print(f"Saved -> {pdf_path}")
    plt.savefig(png_path, dpi=150, bbox_inches='tight')
    print(f"Saved -> {png_path}")
    plt.close()


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Stacked exam score histogram")
    parser.add_argument('--output', default="stacked_histogram.pdf",
                        help="Output PDF filename")
    parser.add_argument('--data', default=DATA_PATH,
                        help="Path to CSV data file")
    args = parser.parse_args()

    df = load_data(args.data)
    build_stacked(df, args.output)

if __name__ == "__main__":
    main()
