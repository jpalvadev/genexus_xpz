namespace Itrion.Api.Common;

public class PaginationAndFilterDto {
    public int PageIndex { get; set; } = 0;
    public string? SortBy { get; set; }

    private int _pageSize = 10;
    private const int MaxPageSize = 50;

    public int PageSize {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }
}