import numpy as np

class FrameEnhancer:
    """
    Low-Light & Contrast Enhancement Pipeline
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) and Gamma Correction.
    """
    def __init__(self, clip_limit: float = 3.0, tile_grid_size: tuple = (8, 8), gamma: float = 1.4):
        self.clip_limit = clip_limit
        self.tile_grid_size = tile_grid_size
        self.gamma = gamma

    def apply_clahe(self, frame_array: np.ndarray) -> np.ndarray:
        """
        Enhances contrast on dark night-vision channels.
        """
        if frame_array is None or frame_array.size == 0:
            return frame_array
        
        # Simulating CLAHE contrast stretching on 2D array
        enhanced = np.clip(frame_array * self.gamma, 0, 255).astype(np.uint8)
        return enhanced

    def gamma_correction(self, image: np.ndarray, gamma: float = 1.5) -> np.ndarray:
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        return np.take(table, image)

enhancer = FrameEnhancer()
